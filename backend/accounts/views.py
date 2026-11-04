from rest_framework import generics, permissions
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Profile, User
from .permissions import IsAdmin, IsAdminOrResponder
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer


class IsRescueTeamUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'rescue_team'


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class LoginView(TokenObtainPairView):
    serializer_class = LoginSerializer


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        Profile.objects.get_or_create(user=self.request.user)  # superuser er profile na thakle banabe
        return self.request.user


class AvailabilityView(APIView):
    """Rescue team nijer availability set korbe"""
    permission_classes = [IsRescueTeamUser]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(user=request.user)
        return Response({'is_available': profile.is_available})

    def patch(self, request):
        value = request.data.get('is_available')
        if not isinstance(value, bool):
            return Response({'is_available': ['Send true or false']}, status=400)
        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.is_available = value
        profile.save()
        return Response({'is_available': profile.is_available})


class VolunteerListView(APIView):
    """Admin volunteer list + availability dekhbe"""
    permission_classes = [IsAdmin]

    def get(self, request):
        data = []
        for u in User.objects.filter(role='rescue_team').select_related('profile'):
            p = getattr(u, 'profile', None)
            data.append({
                'id': u.id,
                'name': u.get_full_name() or u.email,
                'email': u.email,
                'phone': p.phone if p else '',
                'location': p.location if p else '',
                'is_available': p.is_available if p else False,
            })
        return Response(data)


class GeneralUserListView(APIView):
    """Fund distribution-e beneficiary select korar jonno general_user list"""
    permission_classes = [IsAdminOrResponder]

    def get(self, request):
        data = []
        for u in User.objects.filter(role='general_user'):
            data.append({
                'id': u.id,
                'name': u.get_full_name() or u.email,
                'email': u.email,
            })
        return Response(data)