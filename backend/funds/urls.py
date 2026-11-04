from django.urls import path

from .views import (
    DonationListCreateView, InitiatePaymentView,
    PaymentSuccessView, PaymentFailView, PaymentCancelView,
    BalanceView, FundRequestListCreateView,
    FundDecisionView, FundCompleteView,
)

urlpatterns = [
    path('donations/', DonationListCreateView.as_view()),
    path('donations/initiate/', InitiatePaymentView.as_view()),
    path('donations/payment/success/', PaymentSuccessView.as_view()),
    path('donations/payment/fail/', PaymentFailView.as_view()),
    path('donations/payment/cancel/', PaymentCancelView.as_view()),
    path('funds/balance/', BalanceView.as_view()),
    path('funds/distribute/', FundRequestListCreateView.as_view()),
    path('funds/distribute/<int:pk>/', FundDecisionView.as_view()),
    path('funds/distribute/<int:pk>/complete/', FundCompleteView.as_view()),
]