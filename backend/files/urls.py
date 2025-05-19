from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import web_api

# API router för RESTful endpoints
router = DefaultRouter()

urlpatterns = [
    # API-routes
    path('', include(router.urls)),

    # Direktåtkomst till PDF-fil via sökväg i media-katalogen
    path('pdf-media/<path:path>', web_api.serve_pdf_file, name='serve_pdf_file'),

    # Webb-routes för mappspecifika sidor
    path('web/<slug:slug>/data/', web_api.directory_data, name='directory_data_api'),
]