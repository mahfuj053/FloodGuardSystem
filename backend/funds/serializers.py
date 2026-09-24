from rest_framework import serializers

from accounts.models import User
from .models import Donation, FundDistribution


def _name(user):
    if not user:
        return None
    return user.get_full_name() or user.email


class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = ['id', 'amount', 'currency', 'donation_type', 'details', 'status', 'donor_name', 'created_at']
        read_only_fields = ['id', 'status', 'donor_name', 'created_at']

    def get_donor_name(self, obj):
        return _name(obj.donor)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than 0')
        return value


class FundDistributionSerializer(serializers.ModelSerializer):
    beneficiary = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(role='general_user'))
    beneficiary_name = serializers.SerializerMethodField()
    requested_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = FundDistribution
        fields = ['id', 'beneficiary', 'beneficiary_name', 'amount', 'note', 'status',
                  'requested_by_name', 'approved_by_name', 'created_at']
        read_only_fields = ['id', 'status', 'beneficiary_name', 'requested_by_name',
                            'approved_by_name', 'created_at']

    def get_beneficiary_name(self, obj):
        return _name(obj.beneficiary)

    def get_requested_by_name(self, obj):
        return _name(obj.requested_by)

    def get_approved_by_name(self, obj):
        return _name(obj.approved_by)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError('Amount must be greater than 0')
        return value


class DecisionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=['approved', 'rejected'])