"""
URL configuration for valvx_project project.
"""
from django.contrib import admin
from django.urls import path, include
from api.pdf import register_pdf_api_routes
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse, JsonResponse, FileResponse, Http404
from django.views.decorators.csrf import csrf_exempt
from django.views.static import serve as static_serve
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

# Ta bort eventuella tidigare static patterns för att undvika dubbletter
# Definiera om urlpatterns för att säkerställa rätt ordning
if settings.DEBUG:
    # För utvecklingsläge, hantera media-filer direkt via Django
    # Detta gör att vi kan servera PDF-filer direkt via /media/ URL:er
    media_urlpatterns = static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    static_urlpatterns = static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Viktigt: Lägg media patterns först i listan före alla Django-views
    # Detta gör att /media/ fångas upp direkt och skickas till filsystemet
    urlpatterns = media_urlpatterns + urlpatterns + static_urlpatterns
    
    # Lägg till extra loggning för att spåra media-förfrågningar i utvecklingsläge
    from django.views.decorators.cache import never_cache
    from django.contrib.staticfiles.views import serve
    
    @never_cache
    def logged_media_serve(request, path, document_root=None, **kwargs):
        """Wrapper runt Django's static serve som loggar alla förfrågningar"""
        import logging
        logger = logging.getLogger('django')
        logger.info(f"Media request: {path} (from {document_root})")
        return serve(request, path, document_root=document_root, **kwargs)
    
    # Lägg till en direkt URL för media-filer som loggar alla förfrågningar
    from django.urls import re_path
    urlpatterns += [
        re_path(r'^media-debug/(?P<path>.*)$', logged_media_serve, 
                {'document_root': settings.MEDIA_ROOT}, name='media_debug'),
    ]

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

# Lägg till en dedikerad URL-pattern för media-filer - utan trailing slash för att undvika 301-redirect
urlpatterns.append(path('direct/media/<path:path>', serve_media_file, name='direct_media_file'))

# Lägg till även en direct-path för PDFer som används ofta
from django.views.static import serve as static_serve
urlpatterns.append(path('pdf-direct/', serve_media_file, name='pdf_direct'))

# Skapa en särskild filnamnshämtare för PDF-filer - för att lösa 404-problem
def pdf_file_finder(request):
    """Hittar PDF-filer baserat på delar av filnamnet"""
    import os
    
    # Hämta sökparameter (filnamn eller del av filnamn)
    filename_part = request.GET.get('filename', '')
    if not filename_part or not filename_part.endswith('.pdf'):
        return JsonResponse({'error': 'Invalid or missing filename parameter'}, status=400)
    
    # Leta i alla viktiga PDF-kataloger
    media_root = settings.MEDIA_ROOT
    project_files_dir = os.path.join(media_root, 'project_files')
    
    # Samla alla matchande filer
    matching_files = []
    for root, dirs, files in os.walk(project_files_dir):
        for file in files:
            if filename_part in file and file.endswith('.pdf'):
                rel_path = os.path.relpath(os.path.join(root, file), media_root)
                matching_files.append({
                    'filename': file,
                    'path': rel_path,
                    'url': f'/media/{rel_path}',
                    'direct_url': f'/pdf/{os.path.relpath(os.path.join(root, file), project_files_dir)}'
                })
    
    if request.GET.get('stream', 'false').lower() == 'true' and matching_files:
        # Om stream=true, servera första matchande fil direkt
        filepath = os.path.join(media_root, matching_files[0]['path'])
        try:
            response = FileResponse(open(filepath, 'rb'), content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="{os.path.basename(filepath)}"'
            return response
        except Exception as e:
            return JsonResponse({'error': f'Error streaming file: {str(e)}'}, status=500)
    
    return JsonResponse({'files': matching_files}, safe=False)



# Lägg till PDF-sökning i URL-patterns
urlpatterns.append(path('pdf-finder/', pdf_file_finder, name='pdf_finder'))

# Direkt åtkomst till PDF via path
urlpatterns.append(path('pdf/<path:path>', lambda request, path: static_serve(
    request, 
    path=f"project_files/{path}", 
    document_root=settings.MEDIA_ROOT
), name='pdf_path_direct'))
