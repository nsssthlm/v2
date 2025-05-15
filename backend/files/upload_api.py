from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Directory, File
from core.models import User
import os

@api_view(['POST'])
@permission_classes([AllowAny])  # I produktion bör detta ändras till IsAuthenticated
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    """
    API-endpoint för att ladda upp PDF-filer
    """
    # Hämta directory_slug från query parameters
    directory_slug = request.query_params.get('directory_slug', None)
    if not directory_slug:
        return Response(
            {"detail": "Mappparametern saknas."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Hämta mappen
    directory = get_object_or_404(Directory, slug=directory_slug)
    
    # Validera att en fil har skickats
    if 'file' not in request.FILES:
        return Response(
            {"detail": "Ingen fil har skickats."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    file_obj = request.FILES['file']
    
    # Kontrollera filtyp (ska vara PDF)
    if not file_obj.name.endswith('.pdf'):
        return Response(
            {"detail": "Endast PDF-filer är tillåtna."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Kontrollera filstorlek (max 20MB)
    if file_obj.size > 20 * 1024 * 1024:
        return Response(
            {"detail": "Filstorleken får inte överstiga 20 MB."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Hämta filens namn
    name = request.data.get('name', os.path.splitext(file_obj.name)[0])
    description = request.data.get('description', '')
    
    # Använd första användaren som uppladdare i utvecklingsmiljö
    # I produktion bör detta vara request.user
    user = User.objects.first()
    
    # Skapa fil-objektet
    # Här finns en default-fallback för project om directory.project är None 
    project = directory.project
    if project is None:
        # Använd första tillgängliga projektet om inget specifikt är angivet
        from core.models import Project
        project = Project.objects.first()
        if project is None:
            # Om inget projekt finns, skapa ett standardprojekt
            project = Project.objects.create(
                name="Default Projekt", 
                description="Automatiskt skapat för filer", 
                start_date="2025-05-15"
            )
    
    file_instance = File(
        name=name,
        directory=directory,
        project=project,
        file=file_obj,
        content_type='application/pdf',
        size=file_obj.size,
        description=description,
        uploaded_by=user
    )
    file_instance.save()
    
    return Response({
        "detail": "Filen har laddats upp.",
        "file_id": file_instance.id,
        "name": file_instance.name,
        "url": request.build_absolute_uri(file_instance.file.url)
    }, status=status.HTTP_201_CREATED)