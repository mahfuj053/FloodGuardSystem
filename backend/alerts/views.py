from django.core.mail import send_mass_mail
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import User
from accounts.permissions import IsAdmin
from .models import FloodAlert, Notification
from .serializers import FloodAlertSerializer, NotificationSerializer


class AlertListCreateView(generics.ListCreateAPIView):
    serializer_class = FloodAlertSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        qs = FloodAlert.objects.select_related('created_by')
        if self.request.user.role != 'admin':
            qs = qs.filter(is_active=True)  # baki der shudhu active alert
        return qs

    def perform_create(self, serializer):
        alert = serializer.save(created_by=self.request.user)
        users = list(User.objects.filter(is_active=True).exclude(id=self.request.user.id))

        # in-app notification
        text = f"[{alert.get_severity_display()}] {alert.title} - {alert.area}"
        Notification.objects.bulk_create(
            [Notification(user=u, alert=alert, message=text) for u in users]
        )

        # email (dev e server terminal e print hoy). email fail korleo alert toiri hobe
        try:
            body = f"{alert.message}\n\nArea: {alert.area}\nSeverity: {alert.get_severity_display()}"
            mails = [(f"FloodGuard Alert: {alert.title}", body, None, [u.email]) for u in users if u.email]
            send_mass_mail(mails, fail_silently=True)
        except Exception as e:
            print("Email error:", e)


class AlertDetailView(generics.RetrieveUpdateAPIView):
    queryset = FloodAlert.objects.select_related('created_by')
    serializer_class = FloodAlertSerializer
    http_method_names = ['get', 'patch']

    def get_permissions(self):
        if self.request.method == 'PATCH':
            return [IsAdmin()]
        return [permissions.IsAuthenticated()]


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).select_related('alert', 'alert__created_by')


class NotificationReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        updated = Notification.objects.filter(pk=pk, user=request.user).update(is_read=True)
        if not updated:
            return Response({'detail': 'Not found.'}, status=404)
        return Response({'status': 'read'})


class NotificationReadAllView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'all read'})