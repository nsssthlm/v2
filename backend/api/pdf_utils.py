"""
Utility functions for PDF file handling
"""
import os
import glob
import logging
from django.conf import settings
from django.http import FileResponse, HttpResponse, Http404
import mimetypes

logger = logging.getLogger(__name__)

def find_pdf_file(project_id, file_path):
    """
    Söker efter PDF-filer i hela projektstrukturen baserat på filnamn och projektid
    
    Args:
        project_id (str): Projekt-ID (format: namn-nummer)
        file_path (str): Sökvägsfragment till PDF-filen
        
    Returns:
        str: Absolut sökväg till hittad PDF-fil, eller None om ingen hittas
    """
    media_root = settings.MEDIA_ROOT
    
    # Normalisera sökvägen
    file_path = file_path.lstrip('/')
    file_name = os.path.basename(file_path)
    
    # Standardsökvägar att leta i
    potential_paths = []
    
    # 1. Direkt i media_root med hela sökvägen
    potential_paths.append(os.path.join(media_root, file_path))
    
    # 2. I project_files-mappen med år/mån/dag/filnamn
    if 'project_files' in file_path:
        parts = file_path.split('project_files/')
        if len(parts) > 1:
            year_path = parts[1]
            potential_paths.append(os.path.join(media_root, 'project_files', year_path))
    
    # 3. Leta i project_files-mappen med exakt filnamn
    for pdf_file in glob.glob(os.path.join(media_root, 'project_files', '**', file_name), recursive=True):
        if os.path.isfile(pdf_file):
            potential_paths.append(pdf_file)
    
    # 4. Leta i mappen uploads om den finns
    uploads_path = os.path.join(media_root, 'uploads', file_name)
    if os.path.isfile(uploads_path):
        potential_paths.append(uploads_path)
    
    # 5. Leta i basic-pdf-manager/uploads om den finns
    basic_pdf_manager_path = os.path.join(settings.BASE_DIR.parent, 'basic-pdf-manager', 'uploads', file_name)
    if os.path.isfile(basic_pdf_manager_path):
        potential_paths.append(basic_pdf_manager_path)
    
    # 6. Sök i alla projektmappar
    if project_id and '-' in project_id:
        # Extrahera projektnummer om det finns
        parts = project_id.split('-')
        if parts[-1].isdigit():
            project_num = parts[-1]
            project_folder = os.path.join(media_root, 'projects', project_num)
            if os.path.exists(project_folder):
                for pdf_file in glob.glob(os.path.join(project_folder, '**', file_name), recursive=True):
                    if os.path.isfile(pdf_file):
                        potential_paths.append(pdf_file)
    
    # Leta igenom alla möjliga sökvägar
    for path in potential_paths:
        if os.path.isfile(path):
            return path
    
    # Inget hittades
    return None

def serve_pdf_file(file_path, filename=None, as_attachment=False):
    """
    Serverar en PDF-fil med rätt Content-Type och headers
    
    Args:
        file_path (str): Absolut sökväg till PDF-filen
        filename (str, optional): Filnamn att visa för användaren
        as_attachment (bool): Om filen ska laddas ner istället för att visas
        
    Returns:
        FileResponse: Django FileResponse med rätt headers
    """
    if not filename:
        filename = os.path.basename(file_path)
    
    try:
        # Öppna filen
        file_obj = open(file_path, 'rb')
        
        # Bestäm content-type
        content_type = 'application/pdf'
        
        # Skapa response
        response = FileResponse(file_obj, content_type=content_type)
        
        # Sätt headers för korrekt visning
        disposition = 'attachment' if as_attachment else 'inline'
        response['Content-Disposition'] = f'{disposition}; filename="{filename}"'
        response['Content-Length'] = os.path.getsize(file_path)
        
        # CORS headers
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization'
        
        # Ta bort headers som kan störa visning i iframe
        for header in ['X-Frame-Options', 'Content-Security-Policy']:
            if header in response:
                del response[header]
                
        return response
        
    except Exception as e:
        logger.error(f"Failed to serve PDF file {file_path}: {str(e)}")
        raise