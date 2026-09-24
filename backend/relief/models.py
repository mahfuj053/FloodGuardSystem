from django.conf import settings
from django.db import models


class ReliefSupply(models.Model):
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='supplies')
    item_type = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField()
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'relief supplies'

    def __str__(self):
        return f"{self.item_type} ({self.quantity})"


class AidDistribution(models.Model):
    class Status(models.TextChoices):
        PLANNED = 'planned', 'Planned'
        IN_TRANSIT = 'in_transit', 'In Transit'
        DELIVERED = 'delivered', 'Delivered'

    supply = models.ForeignKey(ReliefSupply, on_delete=models.PROTECT, related_name='distributions')
    request = models.ForeignKey('requests_help.HelpRequest', on_delete=models.SET_NULL,
                                null=True, blank=True, related_name='distributions')
    distributed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                       related_name='distributions')
    distributed_to = models.CharField(max_length=150)
    quantity = models.PositiveIntegerField()
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.PLANNED)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.quantity} x {self.supply.item_type} to {self.distributed_to} ({self.status})"