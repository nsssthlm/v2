from django.conf import settings
from django.http import FileResponse, HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.views.decorators.clickjacking import xframe_options_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from workspace.models import PDFDocument, FileNode, FileVersion
import os
import json
import uuid
import base64
from datetime import datetime

class PDFServiceAPI:
    """
    API för hantering av PDF-filer, inklusive uppladdning, hämtning och versionshantering
    """
    
    @staticmethod
    @login_required
    def upload_pdf(request):
        """
        Ladda upp en ny PDF eller skapa en ny version av en befintlig PDF
        
        POST-data:
        - file: PDF-filen (base64-encoded)
        - title: Titel på PDF-dokumentet
        - description: Beskrivning av PDF-dokumentet
        - project_id: ID för projektet dokumentet tillhör
        - file_id: (valfritt) ID för befintlig fil om detta är en ny version
        - folder_id: (valfritt) ID för mapp om dokumentet ska läggas i en mapp
        
        Returnerar:
        - JSON med information om det uppladdade dokumentet
        """
        if request.method != 'POST':
            return JsonResponse({'error': 'Endast POST-metoden stöds'}, status=405)
            
        try:
            data = json.loads(request.body)
            
            # Validera obligatoriska fält
            required_fields = ['file', 'title', 'project_id']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'Fältet {field} saknas'}, status=400)
            
            # Extrahera och avkoda base64-data
            file_data_b64 = data['file']
            if file_data_b64.startswith('data:application/pdf;base64,'):
                file_data_b64 = file_data_b64.split('base64,')[1]
                
            file_data = base64.b64decode(file_data_b64)
            
            # Skapa unik filnamn
            unique_filename = f"{uuid.uuid4()}.pdf"
            file_path = os.path.join(settings.MEDIA_ROOT, 'pdf_uploads', unique_filename)
            
            # Säkerställ att mappen finns
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            # Spara filen på disk
            with open(file_path, 'wb') as f:
                f.write(file_data)
            
            # Skapa eller uppdatera posten i databasen
            if 'file_id' in data and data['file_id']:
                # Uppdatera befintlig fil med ny version
                pdf_doc = get_object_or_404(PDFDocument, id=data['file_id'])
                
                # Kontrollera att användaren har behörighet att uppdatera denna fil
                if pdf_doc.project.id != int(data['project_id']):
                    return JsonResponse({'error': 'Åtkomst nekad'}, status=403)
                
                # Skapa en ny version
                pdf_doc.file = f'pdf_uploads/{unique_filename}'
                pdf_doc.title = data['title']
                pdf_doc.description = data.get('description', '')
                pdf_doc.size = len(file_data)
                pdf_doc.version += 1
                pdf_doc.save()
            else:
                # Skapa en ny fil
                project_id = int(data['project_id'])
                folder_id = data.get('folder_id')
                
                # Skapa FileNode först om det behövs
                if folder_id:
                    parent_folder = get_object_or_404(FileNode, id=folder_id, type='folder')
                    file_node = FileNode.objects.create(
                        name=data['title'],
                        type='file',
                        parent=parent_folder,
                        project_id=project_id,
                        created_by=request.user
                    )
                else:
                    # Skapa en rotfil
                    file_node = FileNode.objects.create(
                        name=data['title'],
                        type='file',
                        project_id=project_id,
                        created_by=request.user
                    )
                
                # Skapa FileVersion
                file_version = FileVersion.objects.create(
                    file_node=file_node,
                    file=f'pdf_uploads/{unique_filename}',
                    version=1,
                    content_type='application/pdf',
                    size=len(file_data),
                    created_by=request.user
                )
                
                # Skapa PDFDocument
                pdf_doc = PDFDocument.objects.create(
                    title=data['title'],
                    description=data.get('description', ''),
                    file=f'pdf_uploads/{unique_filename}',
                    size=len(file_data),
                    version=1,
                    project_id=project_id,
                    uploaded_by=request.user
                )
            
            # Returnera information om den sparade PDF:en
            return JsonResponse({
                'id': pdf_doc.id,
                'title': pdf_doc.title,
                'description': pdf_doc.description,
                'version': pdf_doc.version,
                'size': pdf_doc.size,
                'created_at': pdf_doc.created_at.isoformat(),
                'url': request.build_absolute_uri(settings.MEDIA_URL + pdf_doc.file.name)
            })
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
    
    @staticmethod
    @xframe_options_exempt
    def get_pdf_content(request, pdf_id):
        """
        Hämta innehållet i en PDF-fil
        
        GET-parametrar:
        - token: (valfritt) Autentiseringstoken för åtkomst utan cookies
        
        Returnerar:
        - PDF-filens innehåll med korrekt Content-Type
        """
        # Hämta PDF-dokumentet
        pdf_doc = get_object_or_404(PDFDocument, id=pdf_id)
        
        # Kontrollera behörighet
        if not request.user.is_authenticated:
            # Implementera token-baserad autentisering vid behov
            # Token-validering går här
            return HttpResponse('Åtkomst nekad', status=403)
        
        # Kontrollera att användaren har åtkomst till projektet
        if not pdf_doc.project.users.filter(id=request.user.id).exists():
            return HttpResponse('Åtkomst nekad', status=403)
        
        # Returnera PDF-innehållet
        file_path = os.path.join(settings.MEDIA_ROOT, pdf_doc.file.name)
        response = FileResponse(open(file_path, 'rb'), content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="{pdf_doc.title}.pdf"'
        return response
            
# Lägg till fler API-metoder
    @staticmethod
    @login_required
    def get_pdf_list(request, folder_id=None):
        """
        Hämta en lista över alla PDF-filer, optionellt filtrerat per mapp
        
        GET-parametrar:
        - folder_id: (valfritt) ID för mappen att filtrera på
        
        Returnerar:
        - JSON med lista över PDF-dokument
        """
        try:
            # Base query - filtrera på användarens projekt
            user_projects = request.user.projects.all()
            query = PDFDocument.objects.filter(project__in=user_projects)
            
            # Om folder_id är specificerat, filtrera på den mappen
            if folder_id is not None:
                # Hitta alla FileNode-objekt i den specificerade mappen
                if folder_id == 'root':
                    # Specialfall: "root" betyder rotmappen (null parent)
                    file_nodes = FileNode.objects.filter(
                        project__in=user_projects,
                        type='file',
                        parent__isnull=True
                    )
                else:
                    # Annars hitta alla filer i den specificerade mappen
                    file_nodes = FileNode.objects.filter(
                        project__in=user_projects,
                        type='file',
                        parent_id=folder_id
                    )
                
                # Hämta PDF-dokument som är kopplade till dessa FileNode-objekt via FileVersion
                file_versions = FileVersion.objects.filter(file_node__in=file_nodes)
                pdf_ids = set()
                
                # Samla alla unika PDF-IDs
                for version in file_versions:
                    # Här måste vi göra en mappning mellan FileVersion och PDFDocument baserat på filväg
                    pdf_document = PDFDocument.objects.filter(file=version.file).first()
                    if pdf_document:
                        pdf_ids.add(pdf_document.id)
                
                # Filtrera PDF-dokumenten baserat på de ID:n vi hittat
                query = query.filter(id__in=pdf_ids)
            
            # Exekvera queryn och samla resultaten
            pdf_documents = []
            for doc in query:
                pdf_documents.append({
                    'id': doc.id,
                    'title': doc.title,
                    'description': doc.description,
                    'version': doc.version,
                    'size': doc.size,
                    'created_at': doc.created_at.isoformat(),
                    'updated_at': doc.updated_at.isoformat(),
                    'uploaded_by': doc.uploaded_by.username if doc.uploaded_by else 'Unknown',
                    'unique_id': str(doc.unique_id),
                    'url': request.build_absolute_uri(f'/api/pdf/{doc.id}/content/')
                })
            
            return JsonResponse({'pdf_documents': pdf_documents})
            
        except Exception as e:
            import traceback
            traceback.print_exc()
            return JsonResponse({'error': str(e)}, status=500)
            
    @staticmethod
    @login_required
    def get_pdf_annotations(request, pdf_id):
        """
        Hämta alla annotationer för en PDF
        
        Returnerar:
        - JSON med lista över annotationer
        """
        # Implementering kommer senare
        return JsonResponse({'annotations': []})

# Registrera API-rutter
def register_pdf_api_routes(urlpatterns):
    """
    Registrera URL-mönster för PDF API
    """
    from django.urls import path
    
    urlpatterns.extend([
        path('api/pdf/upload/', csrf_exempt(PDFServiceAPI.upload_pdf), name='pdf-upload'),
        path('api/pdf/<int:pdf_id>/content/', PDFServiceAPI.get_pdf_content, name='pdf-content'),
        path('api/pdf/list/', PDFServiceAPI.get_pdf_list, name='pdf-list'),
        path('api/pdf/list/<str:folder_id>/', PDFServiceAPI.get_pdf_list, name='pdf-list-folder'),
        path('api/pdf/<int:pdf_id>/annotations/', PDFServiceAPI.get_pdf_annotations, name='pdf-annotations'),
    ])