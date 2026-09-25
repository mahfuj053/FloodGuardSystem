from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db import models


class Message(models.Model):
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages')
    # receiver khali thakle group chat
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                 null=True, blank=True, related_name='received_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender.email}: {self.content[:30]}"


class Feedback(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='feedbacks')
    message = models.TextField()
    rating = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.email} ({self.rating}/5)"


class AffectedArea(models.Model):
    class Severity(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'

    class Trend(models.TextChoices):
        RISING = 'rising', 'Rising'
        STABLE = 'stable', 'Stable'
        FALLING = 'falling', 'Falling'

    name = models.CharField(max_length=150)
    severity = models.CharField(max_length=10, choices=Severity.choices, default=Severity.MEDIUM)
    water_level_m = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    water_trend = models.CharField(max_length=10, choices=Trend.choices, default=Trend.STABLE)
    people_affected = models.PositiveIntegerField(default=0)
    active_teams = models.PositiveIntegerField(default=0)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.name} ({self.severity})"