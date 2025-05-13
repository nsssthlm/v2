from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('notifications', views.NotificationViewSet)
router.register('meetings', views.MeetingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
