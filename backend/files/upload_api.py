from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.parsers import MultiPartParser, FormParser
from .models import Directory, File, Project
from core.models import User
import os
import uuid
import logging
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from datetime import datetime

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])  # I produktion bör detta ändras till IsAuthenticated
@parser_classes([MultiPartParser, FormParser])
def upload_file(request):
    """
    API-endpoint för att ladda upp PDF-filer
    """
    try:
        # Validera att en fil har skickats
        if 'file' not in request.FILES:
            return Response(
                {"detail": "Ingen fil har skickats."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        file_obj = request.FILES['file']
        
        # Kontrollera filtyp (ska vara PDF)
        if not file_obj.name.lower().endswith('.pdf'):
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
        
        # Bestäm vilket projekt och vilken mapp filen ska tillhöra
        project_id = request.data.get('project_id')
        directory_id = request.data.get('directory', None)
        directory_slug = request.query_params.get('directory_slug')
        
        # Hämta eller skapa en mapp för uppladdningen
        directory = None
        project = None
        
        if directory_id:
            # Om directory_id anges, använd den specifika mappen
            try:
                directory = Directory.objects.get(id=directory_id)
                project = directory.project
            except Directory.DoesNotExist:
                pass
        
        elif directory_slug:
            # Om directory_slug anges, försök hitta mappen
            try:
                directory = Directory.objects.get(slug=directory_slug)
                project = directory.project
            except Directory.DoesNotExist:
                pass
        
        # Om inget av ovanstående fungerade, ta projektets rotmapp eller skapa en temporär
        if not directory and project_id:
            try:
                project = Project.objects.get(id=project_id)
                # Försök hitta eller skapa projektets rotmapp
                directory, created = Directory.objects.get_or_create(
                    project=project,
                    parent=None,
                    defaults={
                        'name': 'Root',
                        'slug': f"{project.slug}-root",
                        'description': 'Root folder for this project'
                    }
                )
            except Project.DoesNotExist:
                # Om projektet inte finns, använd första tillgängliga projektet
                try:
                    project = Project.objects.first()
                    if project:
                        directory, created = Directory.objects.get_or_create(
                            project=project,
                            parent=None,
                            defaults={
                                'name': 'Root',
                                'slug': f"{project.slug}-root",
                                'description': 'Root folder for this project'
                            }
                        )
                except:
                    pass
        
        # Om vi fortfarande inte har en mapp, använd demomappen
        if not directory:
            directory, created = Directory.objects.get_or_create(
                slug="test1-44",
                defaults={
                    'name': 'Demo Folder',
                    'description': 'Temporary folder for uploads'
                }
            )
            project = directory.project
        
        # Hämta beskrivande information för filen
        name = request.data.get('name', os.path.splitext(file_obj.name)[0])
        description = request.data.get('description', '')
        
        # Använd första användaren som uppladdare i utvecklingsmiljö
        # I produktion bör detta vara request.user
        user = User.objects.first()
        
        # Skapa dagens datummapp
        today = datetime.now()
        date_path = f"project_files/{today.strftime('%Y/%m/%d')}"
        
        # Spara filen till disk
        filename = f"{uuid.uuid4().hex}.pdf"
        file_path = os.path.join(date_path, filename)
        
        # Spara filen med Django's storage-system
        file_storage_path = default_storage.save(file_path, ContentFile(file_obj.read()))
        
        # Skapa File-objekt i databasen
        new_file = File.objects.create(
            name=name,
            description=description,
            file=file_storage_path,
            size=file_obj.size,
            uploaded_by=user,
            directory=directory,
            project=project,
            mimetype='application/pdf'
        )
        
        # Returnera fileinfo inklusive URL för att visa filen
        from django.conf import settings
        fileinfo = {
            'id': new_file.id,
            'name': new_file.name,
            'description': new_file.description,
            'size': new_file.size,
            'created_at': new_file.created_at,
            'file_url': f"{settings.MEDIA_URL}{new_file.file.name}",
            'directory': directory.id if directory else None,
            'project': project.id if project else None,
        }
        
        return Response(fileinfo, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        # Logga felet så vi kan se det i terminalen
        import traceback
        print(f"Error in upload_file: {str(e)}")
        print(traceback.format_exc())
        
        # Returnera felet till klienten
        return Response(
            {"detail": f"Ett fel uppstod vid uppladdning: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )