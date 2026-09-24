from django.urls import path

from .views import RequestListCreateView, RequestDetailView, RequestRespondView

urlpatterns = [
    path('requests/', RequestListCreateView.as_view()),
    path('requests/<int:pk>/', RequestDetailView.as_view()),
    path('requests/<int:pk>/respond/', RequestRespondView.as_view()),
]