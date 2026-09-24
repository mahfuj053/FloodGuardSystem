from django.contrib import admin
from .models import FloodAlert, Notification

admin.site.register(FloodAlert)
admin.site.register(Notification)