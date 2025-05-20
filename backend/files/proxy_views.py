import mimetypes
import os
import urllib.parse
from django.http import FileResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.db.models import Model
from .models import File  # Import direkt från modeller
import logging

logger = logging.getLogger('files')

class PDFProxyView(APIView):
    """
    Proxy view som serverar PDF-filer från media-mappen med korrekta headers
    för att kringgå CORS-begränsningar och möjliggöra inline-visning
    """
    permission_classes = []  # Tillåt åtkomst utan autentisering för enklare testning

    def get(self, request, file_id=None):
        try:
            if not file_id:
                return Response({"error": "Inget fil-ID angivet"}, status=status.HTTP_400_BAD_REQUEST)
            
            logger.debug(f"Försöker hämta fil med ID: {file_id}")
            
            # Hämta fil från databasen
            try:
                file_obj = File.objects.get(pk=file_id)
            except Exception as db_error:
                logger.error(f"Kunde inte hitta fil med ID {file_id}: {str(db_error)}")
                return Response({"error": f"Filen med ID {file_id} existerar inte eller kunde inte hämtas"}, 
                                status=status.HTTP_404_NOT_FOUND)
            
            # Hämta den fysiska filen
            file_path = os.path.join(settings.MEDIA_ROOT, str(file_obj.file))
            logger.debug(f"Filsökväg: {file_path}")
            
            if not os.path.exists(file_path):
                logger.error(f"Filen existerar inte på disk: {file_path}")
                return Response({"error": "Filen hittades inte på disk"}, status=status.HTTP_404_NOT_FOUND)
            
            # Bestäm MIME-typ baserat på filändelse
            content_type, encoding = mimetypes.guess_type(file_path)
            content_type = content_type or 'application/octet-stream'
            
            # Skapa ett filnamnssäkert filnamn för nedladdning
            filename = urllib.parse.quote(file_obj.name or os.path.basename(file_path))
            
            # Skapa en FileResponse med korrekta headers
            response = FileResponse(open(file_path, 'rb'), content_type=content_type)
            
            # Lägg till headers för att tillåta korrekt embedding och filnedladdning
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            response['X-Frame-Options'] = 'SAMEORIGIN'
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization'
            
            logger.debug(f"Serverar fil: {filename} med content-type: {content_type}")
            return response
            
        except Exception as e:
            logger.error(f"Fel vid hämtning av fil: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def options(self, request, *args, **kwargs):
        """
        Hantera OPTIONS-förfrågningar för CORS-preflight
        """
        # Skapa en korrekt DRF-response istället för HttpResponse för att matcha APIView:s return-typ
        response = Response(
            {},  # Tom data
            status=status.HTTP_200_OK,
            headers={
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
            }
        )
        return response