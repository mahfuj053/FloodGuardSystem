from django.urls import path

from .views import DashboardStatsView, AnalyticsView

urlpatterns = [
    path('stats/dashboard/', DashboardStatsView.as_view()),
    path('stats/analytics/', AnalyticsView.as_view()),
]