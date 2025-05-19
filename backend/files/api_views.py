from django.http import FileResponse, HttpResponse, Http404
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import os
import mimetypes
import logging
import traceback

# Set up logging
logger = logging.getLogger(__name__)

@api_view(['GET', 'HEAD', 'OPTIONS'])
@permission_classes([AllowAny])
def serve_project_file(request, project_id, path_info):
    """
    Enhanced API endpoint to serve project files, particularly PDFs.
    
    URL pattern: /api/files/web/{project-slug}/{path-to-file}
    Example: /api/files/web/karlatornet-31/data/project_files/2025/05/19/example.pdf
    """
    # Handle CORS preflight requests
    if request.method == 'OPTIONS':
        response = HttpResponse()
        response['Allow'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization'
        return response
    
    try:
        print(f"[PDF Debug] Accessing file: project={project_id}, path={path_info}")
        
        # Safety check to prevent directory traversal
        if '..' in path_info:
            print(f"[PDF Debug] Potential directory traversal attempt: {path_info}")
            raise Http404("Invalid path")
        
        # Try multiple potential file locations
        potential_paths = []
        media_root = settings.MEDIA_ROOT
        
        # Normalize paths
        if path_info.startswith('/'):
            path_info = path_info[1:]
        
        # Option 1: For URLs like .../api/files/web/project-id/data/project_files/YYYY/MM/DD/filename.pdf
        if 'project_files' in path_info:
            # Extract just the year/month/day/filename part
            parts = path_info.split('project_files/')
            if len(parts) > 1:
                year_path = parts[1]
                potential_paths.append(os.path.join(media_root, 'project_files', year_path))
        
        # Option 2: Direct path in media root
        potential_paths.append(os.path.join(media_root, path_info))
        
        # Option 3: In project_files directory
        potential_paths.append(os.path.join(media_root, 'project_files', path_info))
        
        # Option 4: Look through all project_files folders
        if path_info.endswith('.pdf'):
            import glob
            filename = os.path.basename(path_info)
            for pdf_file in glob.glob(os.path.join(media_root, 'project_files', '**', filename), recursive=True):
                if os.path.isfile(pdf_file):
                    potential_paths.append(pdf_file)
        
        # Find the first matching file
        file_path = None
        for path in potential_paths:
            if os.path.exists(path) and os.path.isfile(path):
                file_path = path
                print(f"[PDF Debug] Found file at: {file_path}")
                break
        
        if not file_path:
            # Log all attempted paths for debugging
            print(f"[PDF Debug] File not found. Tried paths: {potential_paths}")
            print(f"[PDF Debug] Media root: {media_root}")
            
            # List files in media/project_files for debugging
            project_files_dir = os.path.join(media_root, 'project_files')
            if os.path.exists(project_files_dir):
                print(f"[PDF Debug] Contents of project_files directory:")
                for root, dirs, files in os.walk(project_files_dir):
                    for file in files:
                        if file.endswith('.pdf'):
                            print(f"  - {os.path.join(root, file)}")
            
            return HttpResponse(
                f"File not found. Path: {path_info}".encode('utf-8'),
                status=404,
                content_type='text/plain'
            )
        
        # Determine content type based on file extension
        file_ext = os.path.splitext(file_path)[1].lower()
        content_type = None
        
        # Explicitly set content-type for PDFs
        if file_ext == '.pdf':
            content_type = 'application/pdf'
        else:
            # For other files, try to detect the MIME type
            content_type, _ = mimetypes.guess_type(file_path)
            if not content_type:
                # Default to binary if we can't determine the MIME type
                content_type = 'application/octet-stream'
        
        # For HEAD requests, return headers only
        if request.method == 'HEAD':
            response = HttpResponse(content_type=content_type)
            response['Content-Length'] = os.path.getsize(file_path)
            response['Accept-Ranges'] = 'bytes'
            response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization'
            return response
        
        # Open and return the file
        file_obj = open(file_path, 'rb')
        response = FileResponse(file_obj, content_type=content_type)
        
        # Set headers for proper handling
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
        response['Content-Length'] = os.path.getsize(file_path)
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization'
        
        # Remove headers that might interfere with embedding
        for header in ['X-Frame-Options', 'Content-Security-Policy']:
            if header in response:
                del response[header]
        
        # Debugging info
        print(f"[PDF Debug] Serving file: {file_path}")
        print(f"[PDF Debug] Content-Type: {content_type}")
        print(f"[PDF Debug] Content-Length: {response['Content-Length']}")
        
        return response
        
    except Exception as e:
        print(f"[PDF Debug] Error serving file: {str(e)}")
        traceback.print_exc()
        return HttpResponse(
            f"Error: {str(e)}".encode('utf-8'),
            status=500,
            content_type='text/plain'
        )