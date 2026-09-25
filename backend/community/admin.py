from django.contrib import admin
from .models import Message, Feedback, AffectedArea

admin.site.register(Message)
admin.site.register(Feedback)
admin.site.register(AffectedArea)