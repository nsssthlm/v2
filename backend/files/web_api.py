from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Directory, File
import os

@api_view(['GET'])
@permission_classes([AllowAny])
def directory_data(request, slug):
    """
    API-endpoint för att tillhandahålla data för en specifik mapp till frontend.
    """
    directory = get_object_or_404(Directory, slug=slug)
    
    # Hämta föräldermappen om sådan finns
    parent_data = None
    if directory.parent:
        parent_data = {
            'name': directory.parent.name,
            'slug': directory.parent.slug
        }
    
    # Hämta undermappar
    subfolders = Directory.objects.filter(parent=directory).values('name', 'slug')
    
    # Hämta filer i denna mapp
    files = File.objects.filter(directory=directory, is_latest=True).values(
        'id', 'name', 'file', 'content_type', 'created_at'
    )
    
    # Formatera data för frontend
    data = {
        'id': directory.id,
        'name': directory.name,
        'slug': directory.slug,
        'description': directory.page_description,
        'page_title': directory.page_title or directory.name,
        'subfolders': list(subfolders),
        'files': [{
            'id': file['id'],
            'name': file['name'],
            'file': request.build_absolute_uri(file['file']),
            'content_type': file['content_type'],
            'uploaded_at': file['created_at']
        } for file in files],
    }
    
    # Lägg till föräldermappinformation om den finns
    if parent_data:
        data['parent_name'] = parent_data['name']
        data['parent_slug'] = parent_data['slug']
    
    return Response(data)
    
@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_file(request, file_id):
    """
    API-endpoint för att radera en fil
    """
    try:
        file = get_object_or_404(File, id=file_id)
        
        # Ta bort den fysiska filen 
        if file.file:
            try:
                file.file.delete(save=False)
            except Exception as e:
                pass  # Fortsätt även om filen inte kunde tas bort
        
        # Ta bort databasposten
        file.delete()
        
        return Response({"status": "success", "message": f"Fil {file_id} har raderats"}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)