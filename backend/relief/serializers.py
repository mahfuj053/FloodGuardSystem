from rest_framework import serializers

from .models import ReliefSupply, AidDistribution


class SupplySerializer(serializers.ModelSerializer):
    class Meta:
        model = ReliefSupply
        fields = ['id', 'item_type', 'quantity', 'last_updated']
        read_only_fields = ['id', 'last_updated']


class DistributionSerializer(serializers.ModelSerializer):
    supply_name = serializers.CharField(source='supply.item_type', read_only=True)
    distributed_by_name = serializers.SerializerMethodField()

    class Meta:
        model = AidDistribution
        fields = ['id', 'supply', 'supply_name', 'request', 'distributed_to', 'quantity',
                  'status', 'distributed_by_name', 'updated_at']
        read_only_fields = ['id', 'status', 'supply_name', 'distributed_by_name', 'updated_at']

    def get_distributed_by_name(self, obj):
        return obj.distributed_by.get_full_name() or obj.distributed_by.email


class StatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['planned', 'in_transit', 'delivered'])