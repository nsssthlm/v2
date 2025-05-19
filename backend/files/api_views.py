from django.http import FileResponse, HttpResponse, Http404
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
import os
import mimetypes
import logging

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
        logger.info(f"Accessing file: project={project_id}, path={path_info}")
        
        # Safety check to prevent directory traversal
        if '..' in path_info:
            logger.warning(f"Potential directory traversal attempt: {path_info}")
            raise Http404("Invalid path")
        
        # Try multiple potential file locations
        potential_paths = []
        
        # Option 1: Direct from media with project_id and path_info
        potential_paths.append(os.path.join(settings.MEDIA_ROOT, path_info))
        
        # Option 2: In project_files directory
        potential_paths.append(os.path.join(settings.MEDIA_ROOT, 'project_files', path_info))
        
        # Option 3: Check if it's in a project-specific folder
        # Extract slug from project-slug-number format if it exists
        project_parts = project_id.split('-')
        if len(project_parts) > 1 and project_parts[-1].isdigit():
            project_slug = '-'.join(project_parts[:-1])
            potential_paths.append(os.path.join(settings.MEDIA_ROOT, 'project_files', project_slug, path_info))
        
        # Option 4: Look for file with project_id as directory name
        potential_paths.append(os.path.join(settings.MEDIA_ROOT, 'project_files', project_id, path_info))
        
        # Option 5: Direct in project_files
        if path_info.startswith('2025/'):
            potential_paths.append(os.path.join(settings.MEDIA_ROOT, 'project_files', path_info))
        
        # Find the first matching file
        file_path = None
        for path in potential_paths:
            if os.path.exists(path) and os.path.isfile(path):
                file_path = path
                logger.info(f"Found file at: {file_path}")
                break
        
        if not file_path:
            # Log all attempted paths for debugging
            logger.warning(f"File not found. Tried paths: {potential_paths}")
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
            return response
        
        # Open and return the file
        file_obj = open(file_path, 'rb')
        response = FileResponse(file_obj, content_type=content_type)
        
        # Set headers for proper handling
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
        response['Content-Length'] = os.path.getsize(file_path)
        response['Access-Control-Allow-Origin'] = '*'
        
        # Remove headers that might interfere with embedding
        for header in ['X-Frame-Options', 'Content-Security-Policy']:
            if header in response:
                del response[header]
        
        # Debugging info
        logger.info(f"Serving file: {file_path}")
        logger.info(f"Content-Type: {content_type}")
        
        return response
        
    except Exception as e:
        logger.exception(f"Error serving file: {str(e)}")
        return HttpResponse(
            f"Error: {str(e)}".encode('utf-8'),
            status=500,
            content_type='text/plain'
        )