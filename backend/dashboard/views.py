from datetime import timedelta

from django.db.models import Count, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User, Profile
from accounts.permissions import IsAdmin
from alerts.models import FloodAlert
from funds.models import Donation
from funds.views import get_balance
from relief.models import ReliefSupply, AidDistribution
from requests_help.models import HelpRequest


class DashboardStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        return Response({
            'total_users': User.objects.count(),
            'users_by_role': {r['role']: r['n'] for r in User.objects.values('role').annotate(n=Count('id'))},
            'active_alerts': FloodAlert.objects.filter(is_active=True).count(),
            'help_requests': {
                'total': HelpRequest.objects.count(),
                'pending': HelpRequest.objects.filter(status='pending').count(),
                'in_progress': HelpRequest.objects.filter(status='in_progress').count(),
                'fulfilled': HelpRequest.objects.filter(status='fulfilled').count(),
            },
            'volunteers': {
                'total': User.objects.filter(role='rescue_team').count(),
                'available': Profile.objects.filter(user__role='rescue_team', is_available=True).count(),
            },
            'supplies_in_stock': ReliefSupply.objects.aggregate(t=Sum('quantity'))['t'] or 0,
            'aid_delivered': AidDistribution.objects.filter(status='delivered').count(),
            'funds': get_balance(),
        })


class AnalyticsView(APIView):
    """Chart.js er jonno data"""
    permission_classes = [IsAdmin]

    def get(self, request):
        since = timezone.now() - timedelta(days=7)
        requests_per_day = (HelpRequest.objects.filter(created_at__gte=since)
                            .annotate(day=TruncDate('created_at')).values('day')
                            .annotate(count=Count('id')).order_by('day'))
        donations_per_day = (Donation.objects.filter(created_at__gte=since, status='completed')
                             .annotate(day=TruncDate('created_at')).values('day')
                             .annotate(total=Sum('amount')).order_by('day'))
        return Response({
            'requests_per_day': list(requests_per_day),
            'donations_per_day': list(donations_per_day),
            'requests_by_type': list(HelpRequest.objects.values('type').annotate(count=Count('id'))),
            'requests_by_status': list(HelpRequest.objects.values('status').annotate(count=Count('id'))),
            'aid_by_status': list(AidDistribution.objects.values('status').annotate(count=Count('id'))),
        })