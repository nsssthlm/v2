"""
Direkt PDF-hantering för enkel åtkomst utan krångliga URL-strukturer
"""
import os
import glob
from django.http import HttpResponse, Http404, FileResponse
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET', 'HEAD', 'OPTIONS'])
@permission_classes([AllowAny])
def direct_pdf_view(request, pdf_filename):
    """
    Hitta och returnera en PDF-fil direkt baserat på filnamn.
    URL: /api/pdf-direct/{filename}.pdf
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
    
    # Om inget hittades, testa special-mapping med typiska naming-patterns
    if not possible_locations:
        # Special case för filer som heter BEAst-PDF-Guidelines-2.0_1.pdf etc
        print(f"Sök special-mappning för: {pdf_filename}")
        # Här kan vi lägga till specialfall om vi upptäcker sådana
    
    # Kontrollera om någon fil hittades
    if not possible_locations:
        print(f"PDF not found: {pdf_filename}")
        raise Http404(f"Could not find PDF file: {pdf_filename}")
    
    # Använd den första matchningen
    file_path = possible_locations[0]
    print(f"Serving PDF from: {file_path}")
    
    # Skapa FileResponse för att returnera filen
    try:
        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{pdf_filename}"'
        response['Content-Length'] = os.path.getsize(file_path)
        response['Accept-Ranges'] = 'bytes'
        
        # CORS
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        
        # Ta bort headers som kan störa visning
        for header in ['X-Frame-Options', 'Content-Security-Policy']:
            if header in response:
                del response[header]
                
        return response
    except Exception as e:
        print(f"Error opening PDF: {str(e)}")
        raise Http404(f"Error accessing file: {str(e)}")