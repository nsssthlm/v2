from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Directory, File
import os
import logging
from django.http import FileResponse, HttpResponse
from django.conf import settings

logger = logging.getLogger(__name__)

@api_view(['GET', 'HEAD', 'OPTIONS'])
@permission_classes([AllowAny])
def serve_project_file(request, project_id, path_info):
    """
    Servar projektspecifika filer baserat på projektid och filsökväg
    """
    try:
        # Hantera OPTIONS-anrop för CORS preflight requests
        if request.method == 'OPTIONS':
            response = HttpResponse()
            response['Allow'] = 'GET, HEAD, OPTIONS'
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization'
            return response
            
        print(f"[PDF Debug] Accessing file: project={project_id}, path={path_info}")
            
        # Rensa sökvägen för säkerhet
        clean_path = path_info.rstrip('/').replace('..', '')
        
        # Söka efter filnamnet i media-katalogen
        filename = os.path.basename(clean_path)
        print(f"[PDF Debug] Söker efter fil med namn: {filename}")
        
        # Skapa fullständig sökväg till media-katalogen
        media_dir = settings.MEDIA_ROOT
        
        # Sök efter filen i media-katalogen med hjälp av glob
        import glob
        file_pattern = os.path.join(media_dir, "**", filename)
        matching_files = glob.glob(file_pattern, recursive=True)
        
        if matching_files:
            file_path = matching_files[0]  # Använd första matchande filen
            print(f"[PDF Debug] Hittade matchande fil: {file_path}")
        else:
            # Fallback till direktsökväg
            file_path = os.path.join(media_dir, clean_path)
            
        # Kontrollera om filen finns
        if os.path.exists(file_path) and os.path.isfile(file_path):
            print(f"[PDF Debug] Found file at: {file_path}")
            
            # För HEAD-förfrågningar, returnera bara headers
            if request.method == 'HEAD':
                response = HttpResponse(content_type='application/pdf')
                response['Content-Length'] = os.path.getsize(file_path)
                response['Accept-Ranges'] = 'bytes'
                response['Content-Disposition'] = f'inline; filename="{filename}"'
                response['Access-Control-Allow-Origin'] = '*'
                return response
                
            # För GET-förfrågningar, läs in filen och returnera
            print(f"[PDF Debug] Serving file: {file_path}")
            
            # Detektera filtyp baserat på filändelse
            content_type = 'application/pdf'  # Standard är PDF
            if file_path.lower().endswith('.jpg') or file_path.lower().endswith('.jpeg'):
                content_type = 'image/jpeg'
            elif file_path.lower().endswith('.png'):
                content_type = 'image/png'
            elif file_path.lower().endswith('.gif'):
                content_type = 'image/gif'
            elif file_path.lower().endswith('.svg'):
                content_type = 'image/svg+xml'
                
            print(f"[PDF Debug] Content-Type: {content_type}")
            print(f"[PDF Debug] Content-Length: {os.path.getsize(file_path)}")
                
            response = FileResponse(
                open(file_path, 'rb'),
                content_type=content_type
            )
            
            # Lägg till headers för att underlätta visning
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            response['Content-Length'] = os.path.getsize(file_path)
            
            # CORS och caching-kontroll
            response['Access-Control-Allow-Origin'] = '*'
            response['Cache-Control'] = 'no-store, must-revalidate'
            
            # Ta bort eventuella begränsande headers
            for header in ['X-Frame-Options', 'Content-Security-Policy']:
                if header in response:
                    del response[header]
                    
            return response
        else:
            # Fil hittades inte
            print(f"File not found: {file_path}")
            return HttpResponse(
                f"File not found: {filename}".encode('utf-8'), 
                status=404, 
                content_type='text/plain'
            )
    
    except Exception as e:
        import traceback
        print(f"Error in serve_project_file: {str(e)}")
        traceback.print_exc()
        return HttpResponse(
            f"Error serving file: {str(e)}".encode('utf-8'), 
            status=500, 
            content_type='text/plain'
        )

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_directory(request, slug=None):
    """API-ändpunkt för att radera mappar via slug (inte ID)"""
    try:
        # Hämta mappen som ska raderas
        instance = get_object_or_404(Directory, slug=slug)
        directory_id = instance.id
        slug_to_delete = instance.slug
        
        print(f"Raderar mapp via API: {directory_id} ({slug_to_delete})")
        
        # Hitta alla undermappar rekursivt
        def get_all_child_directories(parent_id):
            child_dirs = Directory.objects.filter(parent_id=parent_id).values_list('id', flat=True)
            all_dirs = list(child_dirs)
            
            for child_id in child_dirs:
                child_subdirs = get_all_child_directories(child_id)
                if child_subdirs:
                    all_dirs.extend(child_subdirs)
                    
            return all_dirs
        
        # Hitta alla undermappar
        child_directory_ids = get_all_child_directories(directory_id)
        print(f"Undermappar som ska raderas: {child_directory_ids}")
        
        # Radera alla filer i dessa mappar
        deleted_files = 0
        
        # Ta bort filer i huvudmappen
        main_folder_files = File.objects.filter(directory_id=directory_id).delete()
        deleted_files += main_folder_files[0] if main_folder_files[0] else 0
        
        # Ta bort filer i undermappar
        for dir_id in child_directory_ids:
            files_deleted = File.objects.filter(directory_id=dir_id).delete()
            deleted_files += files_deleted[0] if files_deleted[0] else 0
        
        # Avmarkera is_sidebar_item flaggan för alla mappar före radering
        Directory.objects.filter(id=directory_id).update(is_sidebar_item=False)
        if child_directory_ids:
            Directory.objects.filter(id__in=child_directory_ids).update(is_sidebar_item=False)
        
        # Radera alla undermappar
        deleted_directories = 0
        if child_directory_ids:
            delete_result = Directory.objects.filter(id__in=child_directory_ids).delete()
            deleted_directories = delete_result[0] if delete_result[0] else 0
        
        # Radera slutligen huvudmappen
        instance.delete()
        
        # Returnera detaljerad information om raderingen
        return Response({
            "success": True,
            "message": f"Mappen '{slug_to_delete}' och allt dess innehåll har raderats",
            "details": {
                "deleted_directories": deleted_directories + 1,  # +1 för huvudmappen
                "deleted_files": deleted_files,
                "slug": slug_to_delete,
                "id": directory_id
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        # Om något går fel, logga felet och returnera felmeddelande
        print(f"Fel vid radering av mapp: {str(e)}")
        return Response({
            "success": False,
            "error": f"Kunde inte radera mappen: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)