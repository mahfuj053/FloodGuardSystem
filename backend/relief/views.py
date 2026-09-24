from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import generics, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdmin, IsAdminOrResponder
from alerts.models import Notification
from .models import ReliefSupply, AidDistribution
from .serializers import SupplySerializer, DistributionSerializer, StatusSerializer


class SupplyViewSet(viewsets.ModelViewSet):
    queryset = ReliefSupply.objects.order_by('item_type')
    serializer_class = SupplySerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsAdminOrResponder()]   # dekhte parbe admin + responder
        return [IsAdmin()]                  # add/edit/delete shudhu admin

    def perform_create(self, serializer):
        serializer.save(admin=self.request.user)


class DistributionListCreateView(generics.ListCreateAPIView):
    serializer_class = DistributionSerializer
    permission_classes = [IsAdminOrResponder]
    queryset = AidDistribution.objects.select_related('supply', 'distributed_by')

    @transaction.atomic
    def perform_create(self, serializer):
        supply = ReliefSupply.objects.select_for_update().get(pk=serializer.validated_data['supply'].pk)
        qty = serializer.validated_data['quantity']
        if qty > supply.quantity:
            raise ValidationError({'quantity': f'Not enough stock. Available: {supply.quantity}'})
        supply.quantity -= qty
        supply.save()
        serializer.save(distributed_by=self.request.user)


class DistributionStatusView(APIView):
    permission_classes = [IsAdminOrResponder]

    def patch(self, request, pk):
        dist = get_object_or_404(AidDistribution, pk=pk)
        serializer = StatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        dist.status = serializer.validated_data['status']
        dist.save()

        # delivered hole linked help request fulfilled + victim ke notification
        if dist.status == 'delivered' and dist.request:
            help_request = dist.request
            help_request.status = 'fulfilled'
            help_request.handled_by = help_request.handled_by or request.user
            help_request.save()
            Notification.objects.create(
                user=help_request.user,
                message=f"Aid for your {help_request.get_type_display()} request has been delivered",
            )
        return Response(DistributionSerializer(dist).data)