from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Profile


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'username', 'role', 'is_staff')
    list_filter = ('role', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (('FloodGuard', {'fields': ('role',)}),)
    add_fieldsets = UserAdmin.add_fieldsets + (('FloodGuard', {'fields': ('email', 'role')}),)


admin.site.register(Profile)