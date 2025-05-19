"""
URL configuration for valvx_project project.
"""
from django.contrib import admin
from django.urls import path, include
from api.pdf import register_pdf_api_routes
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from core import custom_views

urlpatterns = [
    path('admin/', admin.site.urls),
    # API endpoints
    path('api/', include([
        # JWT Authentication
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        
        # Status endpoint
        path('status/', lambda request: HttpResponse(b'{"status": "ok"}', content_type='application/json')),
        
        # Custom endpoints för projekthantering
        path('custom/create-project', custom_views.create_project, name='create-project'),
        
        # App routes
        path('', include('core.urls')),
        path('files/', include('files.urls')),
        path('wiki/', include('wiki.urls')),
        path('notifications/', include('notifications.urls')),
        path('workspace/', include('workspace.urls')),
    ])),
]

# Registrera PDF API routes
register_pdf_api_routes(urlpatterns)

# Add static and media URLs - i utvecklingsläge tillåter vi direkt åtkomst till alla filer
# Detta är nödvändigt för att PDF-filer ska kunna visas direkt från servern
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Lägg till en dedikerad view för att servera media-filer med korrekt CORS och headers
from django.http import FileResponse
def serve_media_file(request, path):
    import os
    from django.conf import settings
    from django.http import HttpResponse, Http404, FileResponse
    
    # Säkerhetsvalidering
    if '..' in path:
        raise Http404("Invalid path")
    
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    if not os.path.exists(file_path):
        raise Http404(f"File not found: {path}")
    
    # Detektera filtyp för att sätta Content-Type korrekt
    content_type = None
    if file_path.lower().endswith('.pdf'):
        content_type = 'application/pdf'
    
    # Öppna och returnera filen
    try:
        response = FileResponse(open(file_path, 'rb'), content_type=content_type)
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
        response['Access-Control-Allow-Origin'] = '*'
        
        # Viktigt: Ta bort headers som kan blockera visning i <iframe>
        if 'X-Frame-Options' in response:
            del response['X-Frame-Options']
            
        return response
    except Exception as e:
        raise Http404(f"Error accessing file: {str(e)}")

# Lägg till en dedikerad URL-pattern för media-filer
urlpatterns.append(path('direct/media/<path:path>', serve_media_file, name='direct_media_file'))
