from django.urls import path

from .views import (DonationListCreateView, BalanceView, FundRequestListCreateView,
                    FundDecisionView, FundCompleteView)

urlpatterns = [
    path('donations/', DonationListCreateView.as_view()),
    path('funds/balance/', BalanceView.as_view()),
    path('funds/distribute/', FundRequestListCreateView.as_view()),
    path('funds/distribute/<int:pk>/', FundDecisionView.as_view()),
    path('funds/distribute/<int:pk>/complete/', FundCompleteView.as_view()),
]