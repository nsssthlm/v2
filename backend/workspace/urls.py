from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'files', views.FileNodeViewSet)
router.register(r'file-versions', views.FileVersionViewSet)
router.register(r'comments', views.FileCommentViewSet)
router.register(r'wiki', views.WikiArticleViewSet)
router.register(r'dashboard', views.ProjectDashboardViewSet)
router.register(r'pdf', views.PDFDocumentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]