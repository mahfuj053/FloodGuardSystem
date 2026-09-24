from django.contrib import admin
from .models import Donation, FundDistribution

admin.site.register(Donation)
admin.site.register(FundDistribution)