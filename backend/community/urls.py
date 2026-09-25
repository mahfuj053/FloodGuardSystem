from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import MessageListCreateView, FeedbackListCreateView, AreaViewSet

router = SimpleRouter()
router.register('areas', AreaViewSet, basename='area')

urlpatterns = [
    path('messages/', MessageListCreateView.as_view()),
    path('feedback/', FeedbackListCreateView.as_view()),
    path('', include(router.urls)),
]