from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsGeneralUser
from alerts.models import Notification
from .models import HelpRequest
from .serializers import HelpRequestSerializer, RespondSerializer


class CanRespond(BasePermission):
    """Rescue team, NGO ba admin"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('rescue_team', 'ngo', 'admin')


class RequestListCreateView(generics.ListCreateAPIView):
    serializer_class = HelpRequestSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsGeneralUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = HelpRequest.objects.select_related('user', 'handled_by')
        if user.role == 'general_user':
            qs = qs.filter(user=user)          # victim shudhu nijer request dekhbe
        status = self.request.query_params.get('status')
        if status:
            qs = qs.filter(status=status)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class RequestDetailView(generics.RetrieveAPIView):
    serializer_class = HelpRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = HelpRequest.objects.select_related('user', 'handled_by')
        if user.role == 'general_user':
            qs = qs.filter(user=user)
        return qs


class RequestRespondView(APIView):
    permission_classes = [CanRespond]

    def patch(self, request, pk):
        help_request = get_object_or_404(HelpRequest, pk=pk)
        serializer = RespondSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        help_request.status = serializer.validated_data['status']
        help_request.handled_by = request.user
        help_request.save()

        # victim ke notification
        Notification.objects.create(
            user=help_request.user,
            message=f"Your {help_request.get_type_display()} request is now {help_request.get_status_display()}",
        )
        return Response(HelpRequestSerializer(help_request).data)