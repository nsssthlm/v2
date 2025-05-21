from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import web_views
from . import web_api
from . import upload_api
from . import api_views
from . import proxy_views
from . import api_annotations

# API router för RESTful endpoints
router = DefaultRouter()
router.register('directories', views.DirectoryViewSet)
router.register('files', views.FileViewSet)
router.register('annotations', api_annotations.PDFAnnotationViewSet, basename='pdfannotation')

urlpatterns = [
    # API-routes
    path('', include(router.urls)),
    
    # API för filuppladdning
    path('upload/', upload_api.upload_file, name='api_upload_file'),
    
    # API för att radera en fil
    path('delete/<int:file_id>/', web_api.delete_file, name='delete_file'),
    
    # API för att radera en mapp med alla dess undermappar och filer
    path('delete-directory/<slug:slug>/', web_api.delete_directory, name='delete_directory'),
    
    # Direktåtkomst till fil via ID
    path('direct/<int:file_id>/', web_api.direct_file_download, name='direct_file_download'),
    
    # Ny endpoint för att hämta fil-innehåll (PDF) via ID
    path('get-file-content/<str:file_id>/', web_api.get_file_content, name='get_file_content'),
    
    # Direktåtkomst till PDF-fil via sökväg i media-katalogen (utan avslutande /)
    path('pdf-media/<path:file_path>', web_api.serve_pdf_file, name='serve_pdf_file'),
    
    # Proxy för PDF-filer som löser CORS-problem
    path('pdf-proxy/<int:file_id>/', proxy_views.PDFProxyView.as_view(), name='pdf_proxy'),
    
    # Ny förbättrad endpoint för direkt åtkomst till projektfiler (PDF)
    path('web/<str:project_id>/data/<path:path_info>', api_views.serve_project_file, name='serve_project_file'),
    
    # Specifik pattern för år/månad/dag format för projektfiler
    path('web/<str:project_id>/data/project_files/<int:year>/<int:month>/<int:day>/<str:filename>', 
         lambda request, project_id, year, month, day, filename: 
         api_views.serve_project_file(
             request, 
             project_id, 
             f"project_files/{year}/{month:02d}/{day:02d}/{filename}"
         ), 
         name='serve_project_file_by_date'),
    
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
