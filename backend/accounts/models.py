from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = 'admin', 'Admin'
        RESCUE_TEAM = 'rescue_team', 'Rescue Team'
        NGO = 'ngo', 'NGO'
        GENERAL_USER = 'general_user', 'General User'

    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.GENERAL_USER)

    USERNAME_FIELD = 'email'      # login hobe email diye
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return f"{self.email} ({self.role})"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=150, blank=True)
    organization = models.CharField(max_length=120, blank=True)
    is_available = models.BooleanField(default=False)  # rescue team availability

    def __str__(self):
        return f"Profile of {self.user.email}"