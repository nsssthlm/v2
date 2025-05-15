from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'files', views.FileNodeViewSet, basename='filenode')
router.register(r'versions', views.FileVersionViewSet, basename='fileversion')
router.register(r'comments', views.FileCommentViewSet, basename='filecomment')
router.register(r'wiki', views.WikiArticleViewSet, basename='wikiarticle')
router.register(r'dashboards', views.ProjectDashboardViewSet, basename='projectdashboard')
router.register(r'pdfs', views.PDFDocumentViewSet, basename='pdfdocument')

urlpatterns = [
    path('', include(router.urls)),
]