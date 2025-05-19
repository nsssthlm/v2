"""
Direkt PDF-hantering med Base64-kodning för enklare integration med frontend
"""
import os
import glob
import base64
import mimetypes
from django.http import HttpResponse, Http404, JsonResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET', 'HEAD', 'OPTIONS'])
@permission_classes([AllowAny])
def pdf_base64_view(request, pdf_filename):
    """
    Returnera PDF-fil som Base64-kodad sträng i JSON, för direktvisning i browser
    URL: /api/pdf-base64/{filename}.pdf
    """
    # Hantera CORS preflight requests
    if request.method == 'OPTIONS':
        response = HttpResponse()
        response['Allow'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization'
        return response
    
    # Säkerhetsvalidering
    if '..' in pdf_filename or not pdf_filename.lower().endswith('.pdf'):
        raise Http404("Invalid PDF filename")
    
    # Sök efter filen i alla relevanta kataloger
    possible_locations = []
    
    # 1. Leta i media/project_files med full rekursion
    media_root = settings.MEDIA_ROOT
    project_files_dir = os.path.join(media_root, 'project_files')
    for file_path in glob.glob(os.path.join(project_files_dir, '**', pdf_filename), recursive=True):
        if os.path.isfile(file_path):
            possible_locations.append(file_path)
    
    # 2. Leta i basic-pdf-manager/uploads om den finns
    pdf_manager_dir = os.path.join(settings.BASE_DIR.parent, 'basic-pdf-manager', 'uploads')
    pdf_manager_path = os.path.join(pdf_manager_dir, pdf_filename)
    if os.path.isfile(pdf_manager_path):
        possible_locations.append(pdf_manager_path)
    
    # Kontrollera om någon fil hittades
    if not possible_locations:
        print(f"PDF not found: {pdf_filename}")
        raise Http404(f"Could not find PDF file: {pdf_filename}")
    
    # Använd den första matchningen
    file_path = possible_locations[0]
    print(f"Serving PDF as Base64 from: {file_path}")
    
    # Läs filen och konvertera till Base64
    try:
        with open(file_path, 'rb') as file:
            file_data = file.read()
            base64_data = base64.b64encode(file_data).decode('utf-8')
            
            # Returnera JSON med base64-data och metadata
            response = JsonResponse({
                'filename': pdf_filename,
                'size': os.path.getsize(file_path),
                'content_type': 'application/pdf',
                'base64_data': f'data:application/pdf;base64,{base64_data}'
            })
            
            # CORS-headers för att tillåta åtkomst från frontend
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
            
            return response
    except Exception as e:
        print(f"Error opening PDF for Base64 conversion: {str(e)}")
        raise Http404(f"Error accessing file: {str(e)}")