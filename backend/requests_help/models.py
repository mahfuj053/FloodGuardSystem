from django.conf import settings
from django.db import models


class HelpRequest(models.Model):
    class Type(models.TextChoices):
        RESCUE = 'rescue', 'Rescue'
        FOOD = 'food', 'Food'
        MEDICAL = 'medical', 'Medical'
        SHELTER = 'shelter', 'Shelter'
        OTHER = 'other', 'Other'

    class Priority(models.TextChoices):
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        FULFILLED = 'fulfilled', 'Fulfilled'
        CANCELLED = 'cancelled', 'Cancelled'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='help_requests')
    type = models.CharField(max_length=10, choices=Type.choices)
    description = models.TextField(blank=True)
    location = models.CharField(max_length=150, blank=True)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PENDING)
    handled_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                   null=True, blank=True, related_name='handled_requests')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_type_display()} request by {self.user.email} ({self.status})"