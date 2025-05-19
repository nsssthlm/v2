from django.http import FileResponse, HttpResponse, Http404
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

def register_pdf_api_routes(router=None):
    """
    Funktion för att registrera PDF API routes.
    Detta används i huvudsakliga urls.py för att lägga till PDF-relaterade endpoints.
    """
    urlpatterns = [
        # Direkt åtkomst till PDF innehåll via ID
        path('pdf/<int:id>/content/', pdf_content, name='pdf_content'),
    ]
    return urlpatterns