from rest_framework import serializers

from .models import FloodAlert, Notification


class FloodAlertSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = FloodAlert
        fields = ['id', 'title', 'message', 'area', 'severity', 'latitude', 'longitude',
                  'is_active', 'created_by_name', 'created_at']
        read_only_fields = ['id', 'created_by_name', 'created_at']

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() or obj.created_by.email


class NotificationSerializer(serializers.ModelSerializer):
    alert = FloodAlertSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'message', 'is_read', 'created_at', 'alert']