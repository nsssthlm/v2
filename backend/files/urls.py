from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('directories', views.DirectoryViewSet)
router.register('files', views.FileViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
