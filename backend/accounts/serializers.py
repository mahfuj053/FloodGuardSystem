from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User, Profile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    # admin role e register kora jabe na
    role = serializers.ChoiceField(choices=['general_user', 'rescue_team', 'ngo'], default='general_user')

    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'phone', 'password', 'confirm_password', 'role']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        phone = validated_data.pop('phone', '')
        password = validated_data.pop('password')
        user = User(username=validated_data['email'], **validated_data)
        user.set_password(password)
        user.save()
        Profile.objects.create(user=user, phone=phone)
        return user


class LoginSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'name': f"{self.user.first_name} {self.user.last_name}".strip(),
            'role': self.user.role,
        }
        return data


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone', 'location', 'organization', 'is_available']


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'role', 'profile']
        read_only_fields = ['id', 'email', 'role']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        profile, _ = Profile.objects.get_or_create(user=instance)
        for key, value in profile_data.items():
            setattr(profile, key, value)
        profile.save()
        return instance