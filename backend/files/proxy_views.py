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
from .models import File

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
            
            # Hämta fil från databasen
            file_obj = File.objects.get(pk=file_id)
            
            # Hämta den fysiska filen
            file_path = os.path.join(settings.MEDIA_ROOT, str(file_obj.file))
            
            if not os.path.exists(file_path):
                return Response({"error": "Filen hittades inte"}, status=status.HTTP_404_NOT_FOUND)
            
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
            response['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept'
            
            return response
            
        except File.DoesNotExist:
            return Response({"error": "Filen existerar inte"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def options(self, request, *args, **kwargs):
        """
        Hantera OPTIONS-förfrågningar för CORS-preflight
        """
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Origin, Content-Type, Accept'
        return response