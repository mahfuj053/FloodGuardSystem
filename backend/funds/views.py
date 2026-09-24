from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
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
        return qs.filter(donor=self.request.user)   # baki ra shudhu nijer donation

    def perform_create(self, serializer):
        donation = serializer.save(donor=self.request.user, status='completed')  # simulated payment
        donor_name = self.request.user.get_full_name() or self.request.user.email
        Notification.objects.bulk_create([
            Notification(user=a, message=f"New donation: {donation.amount} {donation.currency} from {donor_name}")
            for a in User.objects.filter(role='admin')
        ])


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