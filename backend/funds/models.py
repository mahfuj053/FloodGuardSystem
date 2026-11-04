from django.conf import settings
from django.db import models


class Donation(models.Model):
    class Type(models.TextChoices):
        FUND = 'fund', 'Fund'
        SUPPLIES = 'supplies', 'Supplies'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'

    donor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='donations')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=5, default='BDT')
    donation_type = models.CharField(max_length=10, choices=Type.choices, default=Type.FUND)
    details = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    # SSLCommerz tracking fields
    transaction_id = models.CharField(max_length=64, unique=True, blank=True, null=True)
    gateway_val_id = models.CharField(max_length=128, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.amount} {self.currency} from {self.donor.email}"


class FundDistribution(models.Model):
    class Status(models.TextChoices):
        REQUESTED = 'requested', 'Requested'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'
        DISTRIBUTED = 'distributed', 'Distributed'

    requested_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                     related_name='fund_requests')
    approved_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                    null=True, blank=True, related_name='fund_approvals')
    beneficiary = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                    null=True, blank=True, related_name='funds_received')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    note = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.REQUESTED)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.amount} to {self.beneficiary} ({self.status})"