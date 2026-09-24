from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import SupplyViewSet, DistributionListCreateView, DistributionStatusView

router = SimpleRouter()
router.register('supplies', SupplyViewSet, basename='supply')

urlpatterns = [
    path('', include(router.urls)),
    path('aid/', DistributionListCreateView.as_view()),
    path('aid/<int:pk>/status/', DistributionStatusView.as_view()),
]