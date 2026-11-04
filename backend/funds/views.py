import uuid
from decimal import Decimal

import requests
from django.conf import settings
from django.db import transaction
from django.db.models import Sum
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsAdmin
from alerts.models import Notification
from .models import Donation, FundDistribution
from .serializers import DonationSerializer, FundDistributionSerializer, DecisionSerializer


class CanDonate(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('ngo', 'general_user')


class IsRescueTeam(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'rescue_team'


class IsAdminOrRescue(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('admin', 'rescue_team')


def get_balance():
    zero = Decimal('0')
    donated = Donation.objects.filter(status='completed', donation_type='fund') \
        .aggregate(t=Sum('amount'))['t'] or zero
    allocated = FundDistribution.objects.filter(status__in=['approved', 'distributed']) \
        .aggregate(t=Sum('amount'))['t'] or zero
    return {'total_donated': donated, 'total_allocated': allocated, 'available': donated - allocated}


class DonationListCreateView(generics.ListCreateAPIView):
    serializer_class = DonationSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [CanDonate()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = Donation.objects.select_related('donor')
        if self.request.user.role == 'admin':
            return qs
        return qs.filter(donor=self.request.user)

    def perform_create(self, serializer):
        # Real money ("fund") donations MUST go through /donations/initiate/
        # so they are actually charged via SSLCommerz. Only non-monetary
        # "supplies" pledges can be marked completed immediately here.
        if serializer.validated_data.get('donation_type') == Donation.Type.FUND:
            raise ValidationError({
                'donation_type': 'Fund donations must go through /api/donations/initiate/ (payment gateway).'
            })
        donation = serializer.save(donor=self.request.user, status='completed')
        donor_name = self.request.user.get_full_name() or self.request.user.email
        Notification.objects.bulk_create([
            Notification(user=a, message=f"New supplies pledge: {donation.amount} {donation.currency} from {donor_name}")
            for a in User.objects.filter(role='admin')
        ])


class InitiatePaymentView(APIView):
    """
    Donor ekta amount dey -> amra ekta pending Donation banai ->
    SSLCommerz-ke bole ekta payment session banate -> GatewayPageURL ferot dei.
    Frontend ei URL-e browser redirect korbe.
    """
    permission_classes = [CanDonate]

    def post(self, request):
        amount = request.data.get('amount')
        details = request.data.get('details', '')
        try:
            amount = Decimal(str(amount))
        except Exception:
            raise ValidationError({'amount': 'Invalid amount'})
        if amount <= 0:
            raise ValidationError({'amount': 'Amount must be greater than 0'})

        tran_id = f"FG{uuid.uuid4().hex[:12].upper()}"
        donation = Donation.objects.create(
            donor=request.user,
            amount=amount,
            donation_type=Donation.Type.FUND,
            details=details,
            status=Donation.Status.PENDING,
            transaction_id=tran_id,
        )

        base_url = f"{request.scheme}://{request.get_host()}"
        user = request.user
        payload = {
            'store_id': settings.SSLCOMMERZ_STORE_ID,
            'store_passwd': settings.SSLCOMMERZ_STORE_PASSWORD,
            'total_amount': str(amount),
            'currency': donation.currency,
            'tran_id': tran_id,
            'success_url': f"{base_url}/api/donations/payment/success/",
            'fail_url': f"{base_url}/api/donations/payment/fail/",
            'cancel_url': f"{base_url}/api/donations/payment/cancel/",
            'cus_name': user.get_full_name() or user.email,
            'cus_email': user.email,
            'cus_add1': 'Dhaka',
            'cus_city': 'Dhaka',
            'cus_country': 'Bangladesh',
            'cus_phone': '01700000000',
            'shipping_method': 'NO',
            'product_name': 'Flood Relief Donation',
            'product_category': 'Donation',
            'product_profile': 'general',
        }

        try:
            resp = requests.post(settings.SSLCOMMERZ_SESSION_API, data=payload, timeout=15)
            result = resp.json()
        except Exception as e:
            donation.status = Donation.Status.FAILED
            donation.save()
            raise ValidationError({'gateway': f'Could not reach payment gateway: {e}'})

        if result.get('status') != 'SUCCESS':
            donation.status = Donation.Status.FAILED
            donation.save()
            raise ValidationError({'gateway': result.get('failedreason') or 'Payment session could not be created'})

        return Response({
            'donation_id': donation.id,
            'transaction_id': tran_id,
            'gateway_url': result['GatewayPageURL'],
        })


def _notify_admins_of_donation(donation):
    donor_name = donation.donor.get_full_name() or donation.donor.email
    Notification.objects.bulk_create([
        Notification(user=a, message=f"New donation: {donation.amount} {donation.currency} from {donor_name}")
        for a in User.objects.filter(role='admin')
    ])


@method_decorator(csrf_exempt, name='dispatch')
class PaymentSuccessView(APIView):
    """
    SSLCommerz, payment-er por, user-er browser-ke POST diye ei URL-e pathay.
    Amra SSLCommerz-er Validation API call kore confirm kori eita real/valid kina,
    tarpor Donation.status completed kori.
    """
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        tran_id = request.data.get('tran_id') or request.GET.get('tran_id')
        val_id = request.data.get('val_id') or request.GET.get('val_id')
        donation = Donation.objects.filter(transaction_id=tran_id).first()

        if not donation or not val_id:
            return HttpResponseRedirect(f"{settings.FRONTEND_URL}/donate/result?status=failed")

        # Already confirmed earlier (browser resubmitted the form, e.g. via back button) —
        # SSLCommerz val_id is single-use, so don't re-validate, just redirect success again.
        if donation.status == Donation.Status.COMPLETED:
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/donate/result?status=success&tran_id={tran_id}"
            )

        try:
            verify = requests.get(settings.SSLCOMMERZ_VALIDATION_API, params={
                'val_id': val_id,
                'store_id': settings.SSLCOMMERZ_STORE_ID,
                'store_passwd': settings.SSLCOMMERZ_STORE_PASSWORD,
                'format': 'json',
            }, timeout=15).json()
        except Exception:
            verify = {}

        valid_status = verify.get('status') in ('VALID', 'VALIDATED')
        amount_matches = Decimal(str(verify.get('amount', '0'))) == donation.amount

        if valid_status and amount_matches:
            donation.status = Donation.Status.COMPLETED
            donation.gateway_val_id = val_id
            donation.save()
            _notify_admins_of_donation(donation)
            return HttpResponseRedirect(
                f"{settings.FRONTEND_URL}/donate/result?status=success&tran_id={tran_id}"
            )

        donation.status = Donation.Status.FAILED
        donation.save()
        return HttpResponseRedirect(
            f"{settings.FRONTEND_URL}/donate/result?status=failed&tran_id={tran_id}"
        )


@method_decorator(csrf_exempt, name='dispatch')
class PaymentFailView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        tran_id = request.data.get('tran_id') or request.GET.get('tran_id')
        Donation.objects.filter(transaction_id=tran_id).update(status=Donation.Status.FAILED)
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/donate/result?status=failed&tran_id={tran_id}")


@method_decorator(csrf_exempt, name='dispatch')
class PaymentCancelView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        tran_id = request.data.get('tran_id') or request.GET.get('tran_id')
        Donation.objects.filter(transaction_id=tran_id).update(status=Donation.Status.FAILED)
        return HttpResponseRedirect(f"{settings.FRONTEND_URL}/donate/result?status=cancelled&tran_id={tran_id}")


class BalanceView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response(get_balance())


class FundRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = FundDistributionSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsRescueTeam()]
        return [IsAdminOrRescue()]

    def get_queryset(self):
        qs = FundDistribution.objects.select_related('requested_by', 'approved_by', 'beneficiary')
        if self.request.user.role == 'admin':
            return qs
        return qs.filter(requested_by=self.request.user)

    def perform_create(self, serializer):
        fund = serializer.save(requested_by=self.request.user)
        Notification.objects.bulk_create([
            Notification(user=a, message=f"Fund request of {fund.amount} needs your approval")
            for a in User.objects.filter(role='admin')
        ])


class FundDecisionView(APIView):
    """Admin approve/reject"""
    permission_classes = [IsAdmin]

    @transaction.atomic
    def patch(self, request, pk):
        fund = get_object_or_404(FundDistribution, pk=pk)
        if fund.status != 'requested':
            raise ValidationError({'status': f'Already {fund.status}'})

        serializer = DecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        decision = serializer.validated_data['status']

        if decision == 'approved':
            available = get_balance()['available']
            if fund.amount > available:
                raise ValidationError({'amount': f'Not enough funds. Available: {available}'})

        fund.status = decision
        fund.approved_by = request.user
        fund.save()
        Notification.objects.create(
            user=fund.requested_by,
            message=f"Your fund request of {fund.amount} was {fund.get_status_display().lower()}",
        )
        return Response(FundDistributionSerializer(fund).data)


class FundCompleteView(APIView):
    """Rescue team approved fund ta victim ke dilo, mark korbe"""
    permission_classes = [IsRescueTeam]

    def patch(self, request, pk):
        fund = get_object_or_404(FundDistribution, pk=pk, requested_by=request.user)
        if fund.status != 'approved':
            raise ValidationError({'status': f'Cannot distribute. Current status: {fund.status}'})
        fund.status = 'distributed'
        fund.save()
        if fund.beneficiary:
            Notification.objects.create(
                user=fund.beneficiary,
                message=f"You received a relief fund of {fund.amount}",
            )
        return Response(FundDistributionSerializer(fund).data)