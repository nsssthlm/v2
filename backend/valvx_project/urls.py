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
from django.views.decorators.csrf import csrf_exempt

urlpatterns.append(path('direct/media/<path:path>', serve_media_file, name='direct_media_file'))

# Funktioner för hantering av PDF-filer
def direct_serve_pdf(request, file_path):
    """Serverar en PDF-fil direkt med rätt Content-Type header och CORS-inställningar"""
    import os
    
    try:
        if not os.path.exists(file_path):
            raise Http404(f"PDF-fil hittades inte: {file_path}")
            
        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
        response['Access-Control-Allow-Origin'] = '*'
        
        # Ta bort headers som kan störa visning i iframe
        if 'X-Frame-Options' in response:
            del response['X-Frame-Options']
            
        return response
    except Exception as e:
        return JsonResponse({'error': f'Fel vid filöppning: {str(e)}'}, status=500)

# Förbättrad PDF-finder funktion
@csrf_exempt
def pdf_file_finder(request):
    """Hittar PDF-filer baserat på delar av filnamnet med direkt streaming"""
    import os
    import glob
    
    # Hämta sökparameter (filnamn eller del av filnamn)
    filename_part = request.GET.get('filename', '')
    if not filename_part or not filename_part.endswith('.pdf'):
        return JsonResponse({'error': 'Invalid or missing filename parameter'}, status=400)
    
    # Leta i alla viktiga PDF-kataloger 
    media_root = settings.MEDIA_ROOT
    project_files_dir = os.path.join(media_root, 'project_files')
    
    # Sök med glob för bättre prestanda
    search_patterns = [
        os.path.join(project_files_dir, '**', f'*{filename_part}*'),  # Sök i alla undermappar
        os.path.join(media_root, '**', f'*{filename_part}*')          # Sök i hela media
    ]
    
    # Samla alla matchande filer
    matching_files = []
    for pattern in search_patterns:
        for filepath in glob.glob(pattern, recursive=True):
            if filepath.lower().endswith('.pdf'):
                rel_path = os.path.relpath(filepath, media_root)
                matching_files.append({
                    'filename': os.path.basename(filepath),
                    'path': rel_path,
                    'url': f'/media/{rel_path}',
                    'filepath': filepath
                })
    
    # Logga sökningen för debugging
    print(f"PDF-sökning: {filename_part}, hittade {len(matching_files)} filer")
    
    # Direkt streaming mode
    if request.GET.get('stream', 'false').lower() == 'true' and matching_files:
        filepath = matching_files[0]['filepath']
        return direct_serve_pdf(request, filepath)
    
    return JsonResponse({'files': matching_files}, safe=False)

# Explicit PDF-access funktion
def serve_pdf_file(request, path):
    import os
    
    # Leta i alla möjliga kataloger efter PDF-filen
    possible_paths = []
    
    # Standardsökväg
    media_root = settings.MEDIA_ROOT
    project_files_dir = os.path.join(media_root, 'project_files')
    standard_path = os.path.join(project_files_dir, path)
    possible_paths.append(standard_path)
    
    # Alternativ sökväg direkt under media
    alternative_path = os.path.join(media_root, path)
    possible_paths.append(alternative_path)
    
    # Prova alla sökvägar
    for file_path in possible_paths:
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return direct_serve_pdf(request, file_path)
    
    # Om vi når hit hittades ingen fil
    return JsonResponse({
        'error': 'PDF file not found',
        'path': path,
        'searched_paths': possible_paths
    }, status=404)

# Lägg till PDF-söknings-URL
urlpatterns.append(path('pdf-finder/', pdf_file_finder, name='pdf_finder'))

# Direkt åtkomst till PDF via path
urlpatterns.append(path('pdf/<path:path>', serve_pdf_file, name='pdf_path_direct'))

# Backupfunktion med vanlig static serve som fallback
from django.views.static import serve as static_serve
urlpatterns.append(path('pdf-static/<path:path>', lambda request, path: static_serve(
    request, 
    path=f"project_files/{path}", 
    document_root=settings.MEDIA_ROOT
), name='pdf_static_direct'))
