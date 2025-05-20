import mimetypes
import os
import urllib.parse
import traceback
from django.http import FileResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.views import View
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import logging

logger = logging.getLogger('files')

class PDFProxyView(APIView):
    """
    Proxy view som serverar PDF-filer från media-mappen med korrekta headers
    för att kringgå CORS-begränsningar och möjliggöra inline-visning
    """
    # Stäng av all autentisering för denna vy
    permission_classes = [AllowAny]
    authentication_classes = []

    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        """Override dispatch för att garantera att CSRF-skydd är inaktiverat"""
        return super().dispatch(request, *args, **kwargs)

    def get(self, request, file_id=None):
        """
        Hämta och servera en PDF-fil med alla nödvändiga CORS-headers.
        """
        try:
            if not file_id:
                return Response({"error": "Inget fil-ID angivet"}, status=status.HTTP_400_BAD_REQUEST)
            
            logger.debug(f"Proxy: Försöker hämta fil med ID: {file_id}")
            
            # Hämta fil från databasen direkt med raw SQL för att undvika typfel
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute("SELECT id, name, file FROM files_file WHERE id = %s", [file_id])
                row = cursor.fetchone()
                
                if not row:
                    logger.error(f"Proxy: Filen med ID {file_id} hittades inte i databasen")
                    return Response(
                        {"error": f"Filen med ID {file_id} existerar inte"}, 
                        status=status.HTTP_404_NOT_FOUND
                    )
                
                db_id, db_name, db_file_path = row
            
            # Konstruera full fysisk sökväg
            file_path = os.path.join(settings.MEDIA_ROOT, db_file_path)
            logger.debug(f"Proxy: Filsökväg: {file_path}")
            
            if not os.path.exists(file_path):
                logger.error(f"Proxy: Filen existerar inte på disk: {file_path}")
                return Response(
                    {"error": "Filen hittades inte på disk"}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Bestäm MIME-typ baserat på filändelse
            content_type, encoding = mimetypes.guess_type(file_path)
            content_type = content_type or 'application/pdf'  # Default till PDF
            
            # Skapa ett filnamnssäkert filnamn för nedladdning
            filename = urllib.parse.quote(db_name or os.path.basename(file_path))
            
            # Skapa en FileResponse med korrekta headers
            with open(file_path, 'rb') as file_obj:
                response = FileResponse(file_obj, content_type=content_type)
                
                # Lägg till alla nödvändiga headers för att tillåta inbäddning och CORS
                response['Content-Disposition'] = f'inline; filename="{filename}"'
                response['X-Frame-Options'] = 'SAMEORIGIN'
                response['Access-Control-Allow-Origin'] = '*'
                response['Access-Control-Allow-Methods'] = 'GET, OPTIONS, HEAD'
                response['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept, Authorization, X-Requested-With'
                response['Access-Control-Allow-Credentials'] = 'true'
                response['Access-Control-Max-Age'] = '86400'  # 24 timmar cache för CORS-preflight
                
                logger.debug(f"Proxy: Serverar fil: {filename} med content-type: {content_type}")
                return response
            
        except Exception as e:
            # Detaljerad felrapportering för enklare felsökning
            logger.error(f"Proxy: Fel vid hämtning av fil: {str(e)}")
            logger.error(traceback.format_exc())
            return Response(
                {"error": str(e), "details": traceback.format_exc()}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                headers={
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, OPTIONS',
                    'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization',
                }
            )
    
    def options(self, request, *args, **kwargs):
        """
        Hantera OPTIONS-förfrågningar för CORS-preflight
        """
        response = Response(
            {},  # Tom data
            status=status.HTTP_200_OK,
            headers={
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS, HEAD',
                'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept, Authorization, X-Requested-With',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Max-Age': '86400',  # 24 timmar cache för CORS-preflight
            }
        )
        return response