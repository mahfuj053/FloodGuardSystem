from django.urls import path

from .views import (AlertListCreateView, AlertDetailView, NotificationListView,
                    NotificationReadView, NotificationReadAllView)

urlpatterns = [
    path('alerts/', AlertListCreateView.as_view()),
    path('alerts/<int:pk>/', AlertDetailView.as_view()),
    path('notifications/', NotificationListView.as_view()),
    path('notifications/read-all/', NotificationReadAllView.as_view()),
    path('notifications/<int:pk>/read/', NotificationReadView.as_view()),
]