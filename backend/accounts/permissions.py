from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class IsResponder(BasePermission):
    """Rescue team ba NGO"""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ('rescue_team', 'ngo')


class IsGeneralUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'general_user'