from rest_framework import serializers

from accounts.models import User
from .models import Message, Feedback, AffectedArea


def _name(user):
    return user.get_full_name() or user.email


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.SerializerMethodField()
    receiver = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role__in=['admin', 'rescue_team', 'ngo']),
        required=False, allow_null=True,
    )

    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'receiver', 'content', 'created_at']
        read_only_fields = ['id', 'sender', 'sender_name', 'created_at']

    def get_sender_name(self, obj):
        return _name(obj.sender)

    def validate_receiver(self, value):
        if value and value == self.context['request'].user:
            raise serializers.ValidationError('You cannot message yourself')
        return value


class FeedbackSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    rating = serializers.IntegerField(min_value=1, max_value=5)

    class Meta:
        model = Feedback
        fields = ['id', 'message', 'rating', 'user_name', 'created_at']
        read_only_fields = ['id', 'user_name', 'created_at']

    def get_user_name(self, obj):
        return _name(obj.user)


class AffectedAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AffectedArea
        fields = ['id', 'name', 'severity', 'water_level_m', 'water_trend', 'people_affected',
                  'active_teams', 'latitude', 'longitude', 'is_active', 'updated_at']
        read_only_fields = ['id', 'updated_at']