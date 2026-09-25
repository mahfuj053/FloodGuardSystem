from django.db.models import Q
from rest_framework import generics, permissions, viewsets

from accounts.permissions import IsAdmin, IsAdminOrResponder
from alerts.models import Notification
from .models import Message, Feedback, AffectedArea
from .serializers import MessageSerializer, FeedbackSerializer, AffectedAreaSerializer


class MessageListCreateView(generics.ListCreateAPIView):
    """GET /messages/ = group chat, GET /messages/?with=<userId> = one-to-one chat"""
    serializer_class = MessageSerializer
    permission_classes = [IsAdminOrResponder]

    def get_queryset(self):
        me = self.request.user
        other = self.request.query_params.get('with')
        qs = Message.objects.select_related('sender', 'receiver')
        if other and other.isdigit():
            return qs.filter(Q(sender=me, receiver_id=other) | Q(sender_id=other, receiver=me))
        return qs.filter(receiver__isnull=True)

    def perform_create(self, serializer):
        msg = serializer.save(sender=self.request.user)
        if msg.receiver:
            sender_name = self.request.user.get_full_name() or self.request.user.email
            Notification.objects.create(user=msg.receiver, message=f"New message from {sender_name}")


class FeedbackListCreateView(generics.ListCreateAPIView):
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Feedback.objects.select_related('user')
        if self.request.user.role == 'admin':
            return qs
        return qs.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AreaViewSet(viewsets.ModelViewSet):
    serializer_class = AffectedAreaSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticated()]
        return [IsAdmin()]

    def get_queryset(self):
        qs = AffectedArea.objects.all()
        if self.request.user.role != 'admin':
            qs = qs.filter(is_active=True)
        return qs