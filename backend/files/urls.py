from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import web_views
from . import web_api
from . import upload_api

# API router för RESTful endpoints
router = DefaultRouter()
router.register('directories', views.DirectoryViewSet)
router.register('files', views.FileViewSet)

urlpatterns = [
    # API-routes
    path('', include(router.urls)),
    
    # API för filuppladdning
    path('upload/', upload_api.upload_file, name='api_upload_file'),
    
    # Webb-routes för mappspecifika sidor
    path('web/', include([
        # Lista alla mappar
        path('', web_views.DirectoryListView.as_view(), name='directory_list'),
        
        # API för att hämta mappdata i JSON-format
        path('<slug:slug>/data/', web_api.directory_data, name='directory_data_api'),
        
        # En specifik mapps sida med URL-mönster: /files/web/mappe-namn-12/
        path('<slug:slug>/', web_views.DirectoryPageView.as_view(), name='directory_page'),
        
        # Ladda upp PDF till en specifik mapp
        path('<slug:slug>/upload/', web_views.UploadPDFView.as_view(), name='upload_pdf'),
        
        # Redigera mappens sida (titel, beskrivning)
        path('<slug:slug>/edit/', web_views.UpdateDirectoryPageView.as_view(), name='edit_directory_page'),
    ])),
]
