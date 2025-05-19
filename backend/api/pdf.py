from django.http import FileResponse, HttpResponse, Http404, JsonResponse
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from files.models import File

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def pdf_content(request, id):
    """
    Hämtar innehållet i en PDF-fil baserat på ID.
    Denna endpoint motsvarar /api/pdf/<id>/content/
    och används för att visa PDF-filer direkt i applikationen.
    """
    try:
        # Hämta fil från databasen
        file_obj = get_object_or_404(File, id=id)
        
        # Kontrollera att filen existerar fysiskt
        file_path = file_obj.file.path
        
        # Öppna och returnera filen som PDF
        response = FileResponse(
            open(file_path, 'rb'),
            content_type='application/pdf'
        )
        
        # Sätt headers för korrekt PDF-visning
        response['Content-Disposition'] = f'inline; filename="{file_obj.name}"'
        
        # Cache-kontroll
        response['Cache-Control'] = 'no-store, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        
        # Tillåt embedding i iframe och cross-origin access
        response.headers.pop('X-Frame-Options', None)
        response['Access-Control-Allow-Origin'] = '*'
        
        print(f"Levererar PDF-fil från /api/pdf/{id}/content/: {file_path}")
        return response
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
def pdf_info(request, id):
    """
    Hämtar metadata om en PDF-fil baserat på ID.
    Denna endpoint motsvarar /api/pdf/<id>/info/
    och används för att visa fildetaljer i PDF-visaren.
    """
    try:
        # Hämta fil från databasen
        file_obj = get_object_or_404(File, id=id)
        
        # Formatera date_created till lämpligt format
        created_date = None
        if hasattr(file_obj, 'date_created') and file_obj.date_created:
            created_date = file_obj.date_created.isoformat()
        
        # Bygg metadata-objekt
        metadata = {
            'id': file_obj.id,
            'filename': file_obj.name,
            'description': getattr(file_obj, 'description', ''),
            'created': created_date,
            'size': file_obj.file.size if hasattr(file_obj.file, 'size') else None,
            'project_id': getattr(file_obj, 'project_id', None),
            'content_url': f'/api/pdf/{id}/content/',
            'folder_id': getattr(file_obj, 'directory_id', None),
        }
        
        return JsonResponse(metadata)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return JsonResponse({"error": str(e)}, status=500)

def register_pdf_api_routes(router=None):
    """
    Funktion för att registrera PDF API routes.
    Detta används i huvudsakliga urls.py för att lägga till PDF-relaterade endpoints.
    """
    urlpatterns = [
        # Direkt åtkomst till PDF innehåll via ID
        path('pdf/<int:id>/content/', pdf_content, name='pdf_content'),
        # Metadata om PDF-filen
        path('pdf/<int:id>/info/', pdf_info, name='pdf_info'),
    ]
    return urlpatterns