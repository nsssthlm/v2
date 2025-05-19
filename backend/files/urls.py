
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import web_api
from . import views

# API router för RESTful endpoints
router = DefaultRouter()
router.register('directories', views.DirectoryViewSet)
router.register('files', views.FileViewSet)

urlpatterns = [
    # API-routes
    path('', include(router.urls)),

    # Direktåtkomst till PDF-fil via sökväg i media-katalogen
    path('pdf-media/<path:path>', web_api.serve_pdf_file, name='serve_pdf_file'),

    # Webb-routes för mappspecifika sidor
    path('web/<slug:slug>/data/', web_api.directory_data, name='directory_data_api'),
    
    # Projektdata endpoint
    path('web/<str:project_slug>/data/', views.ProjectDataView.as_view(), name='project_data_api'),
    
    # Projektsida med nytt format för att matcha frontend-anrop
    path('projects/<slug:project_slug>/data/', views.ProjectDataView.as_view(), name='project_data_api_alt'),
]
