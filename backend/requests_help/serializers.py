from rest_framework import serializers

from .models import HelpRequest


class HelpRequestSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    handled_by_name = serializers.SerializerMethodField()

    class Meta:
        model = HelpRequest
        fields = ['id', 'type', 'description', 'location', 'priority', 'status',
                  'user_name', 'handled_by_name', 'created_at']
        read_only_fields = ['id', 'status', 'user_name', 'handled_by_name', 'created_at']

    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email

    def get_handled_by_name(self, obj):
        if not obj.handled_by:
            return None
        return obj.handled_by.get_full_name() or obj.handled_by.email


class RespondSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['in_progress', 'fulfilled', 'cancelled'])