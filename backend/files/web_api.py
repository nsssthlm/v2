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
    # Kontrollera om detta är en direktnedladdningsbegäran
    direct_param = request.query_params.get('direct', None)
    
    # Om direct=true, hämta filen direkt och returnera den som nedladdning
    if direct_param and direct_param.lower() == 'true':
        # Kontrollera om filnamn angetts
        filename = request.query_params.get('filename', None)
        file_path_param = request.query_params.get('filepath', None)
        
        try:
            # Om vi har en filsökväg, prioritera den
            if file_path_param:
                import os
                from django.conf import settings
                
                # Säkerställ att filsökvägen är relativ till media-katalogen
                if file_path_param.startswith('/'):
                    file_path_param = file_path_param[1:]
                
                # Konstruera fullständig sökväg
                file_path = os.path.join(settings.MEDIA_ROOT, file_path_param)
                
                # Kontrollera att filen existerar och är läsbar
                if not os.path.exists(file_path):
                    return Response({"error": f"Kan inte hitta filen: {file_path_param}"}, status=404)
                
                # Öppna filen direkt
                from django.http import FileResponse
                response = FileResponse(
                    open(file_path, 'rb'),
                    content_type='application/pdf'
                )
                
                # Sätt headers för korrekt visning
                response['Content-Disposition'] = f'inline; filename="{os.path.basename(file_path)}"'
                response.headers.pop('X-Frame-Options', None)
                response['Access-Control-Allow-Origin'] = '*'
                
                print(f"Direktnedladdning av {file_path}")
                return response
                
            # Annars försök med filnamn
            elif filename:
                # Hämta filen från databasen
                file_obj = File.objects.get(name=filename, directory__slug=slug)
                
                # Öppna filen direkt från disk
                import os
                from django.conf import settings
                
                file_path = os.path.join(settings.MEDIA_ROOT, file_obj.file.name)
                
                # Kontrollera att filen finns
                if not os.path.exists(file_path):
                    return Response({"error": "Filen hittades inte på disken"}, status=404)
                    
                # Returnera filen som PDF med öppen filestream
                from django.http import FileResponse
                response = FileResponse(
                    open(file_path, 'rb'),
                    content_type='application/pdf'
                )
                
                # Sätt nödvändiga headers för korrekt PDF-visning
                response['Content-Disposition'] = f'inline; filename="{file_obj.name}.pdf"'
                
                # Radera X-Frame-Options header helt för att tillåta embedding
                response.headers.pop('X-Frame-Options', None)
                
                # Tillåt innehållsdelning mellan olika ursprung
                response['Access-Control-Allow-Origin'] = '*'
                print(f"Serving PDF file via filename: {file_path}")
                
                return response
        except File.DoesNotExist:
            return Response({"error": "Filen hittades inte"}, status=404)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)
    
    # Standardlogik för att hämta mappdata
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
    
@api_view(['GET'])
@permission_classes([AllowAny])
def direct_file_download(request, file_id):
    """
    API-endpoint för att direkt hämta filinnehåll via ID
    """
    try:
        # Hämta filen från databasen
        file_obj = get_object_or_404(File, id=file_id)
        
        # Öppna filen direkt från disk
        import os
        from django.conf import settings
        
        file_path = os.path.join(settings.MEDIA_ROOT, file_obj.file.name)
        
        # Kontrollera att filen finns
        if not os.path.exists(file_path):
            return Response({"error": "Filen hittades inte på disken"}, status=404)
            
        # Returnera filen som PDF med öppen filestream
        from django.http import FileResponse
        response = FileResponse(
            open(file_path, 'rb'),
            content_type='application/pdf'
        )
        
        # Sätt nödvändiga headers för korrekt PDF-visning
        response['Content-Disposition'] = f'inline; filename="{file_obj.name}.pdf"'
        
        # Radera X-Frame-Options header helt för att tillåta embedding
        response.headers.pop('X-Frame-Options', None)
        
        # Tillåt innehållsdelning mellan olika ursprung
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        
        # Underlätta debugging
        print(f"Serving PDF file: {file_path} with content type: {response['Content-Type']}")
        
        return response
    except Exception as e:
        print(f"Error serving PDF: {str(e)}")
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'HEAD', 'OPTIONS'])
@permission_classes([AllowAny])
def serve_pdf_file(request, file_path):
    """
    Dedikerad endpoint för att servera PDF-filer direkt från media-katalogen
    med korrekt Content-Type och headers.
    """
    from django.http import HttpResponse, Http404, FileResponse
    import os
    from django.conf import settings
    
    # Hantera OPTIONS-anrop för CORS preflight requests
    if request.method == 'OPTIONS':
        response = HttpResponse()
        response['Allow'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization'
        return response
    
    try:
        # Rensa sökvägen och skapa fullständig filsökväg
        clean_path = file_path.rstrip('/').replace('..', '')
        full_path = os.path.join(settings.MEDIA_ROOT, clean_path)
        
        # Logga för felsökning
        print(f"Serving PDF file: {full_path}")
        
        # Kontrollera att filen existerar
        if not os.path.exists(full_path) or not os.path.isfile(full_path):
            print(f"PDF file not found: {full_path}")
            
            # Leta efter liknande filer som hjälp för felsökning
            import glob
            parent_dir = os.path.dirname(full_path)
            if os.path.exists(parent_dir):
                similar_files = glob.glob(os.path.join(parent_dir, "*.pdf"))
                if similar_files:
                    print(f"Similar PDF files in directory: {similar_files}")
            
            return HttpResponse(
                f"PDF file not found: {os.path.basename(full_path)}".encode('utf-8'), 
                status=404, 
                content_type='text/plain'
            )
            
        # För HEAD-förfrågningar, returnera bara headers
        if request.method == 'HEAD':
            response = HttpResponse(content_type='application/pdf')
            response['Content-Length'] = os.path.getsize(full_path)
            response['Accept-Ranges'] = 'bytes'
            response['Content-Disposition'] = f'inline; filename="{os.path.basename(full_path)}"'
            response['Access-Control-Allow-Origin'] = '*'
            return response
            
        # För GET-förfrågningar, använd StreamingHttpResponse för att returnera PDF-datan direkt
        with open(full_path, 'rb') as pdf_file:
            response = HttpResponse(pdf_file.read(), content_type='application/pdf')
            
        # Lägg till nödvändiga headers
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(full_path)}"'
        response['Content-Length'] = os.path.getsize(full_path)
        response['Access-Control-Allow-Origin'] = '*'
        
        # Ta bort eventuella headers som kan störa pdf-visning
        for header in ['X-Frame-Options', 'Content-Security-Policy']:
            if header in response:
                del response[header]
                
        # Debugging
        print(f"Successfully served PDF: {full_path}")
        print(f"Content-Type: {response['Content-Type']}")
        print(f"Content-Length: {response['Content-Length']}")
            
        return response
    
    except Exception as e:
        import traceback
        print(f"Error serving PDF: {str(e)}")
        traceback.print_exc()
        return HttpResponse(
            f"Error serving PDF: {str(e)}".encode('utf-8'), 
            status=500, 
            content_type='text/plain'
        )

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

@api_view(['DELETE'])
@permission_classes([AllowAny])
def delete_directory(request, slug):
    """API-ändpunkt för att radera mappar med slug"""
    try:
        # Hämta mappen som ska raderas
        instance = get_object_or_404(Directory, slug=slug)
        directory_id = instance.id
        slug_to_delete = instance.slug
        
        print(f"Raderar mapp via API: {directory_id} ({slug_to_delete})")
        
        # Spara föräldermappens ID om den finns (för att returnera till den senare)
        parent_id = None
        if instance.parent:
            parent_id = instance.parent.id
            parent_slug = instance.parent.slug
        
        # Hitta alla undermappar rekursivt
        def get_all_child_directories(parent_id):
            try:
                child_dirs = Directory.objects.filter(parent_id=parent_id).values_list('id', flat=True)
                all_dirs = list(child_dirs)
                
                for child_id in child_dirs:
                    child_subdirs = get_all_child_directories(child_id)
                    if child_subdirs:
                        all_dirs.extend(child_subdirs)
                        
                return all_dirs
            except Exception as e:
                print(f"Fel vid hämtning av undermappar: {str(e)}")
                return []
        
        # Hitta alla undermappar
        child_directory_ids = get_all_child_directories(directory_id)
        print(f"Undermappar som ska raderas: {child_directory_ids}")
        
        # Radera alla filer i dessa mappar
        deleted_files = 0
        
        try:
            # Ta bort filer i huvudmappen
            main_folder_files = File.objects.filter(directory_id=directory_id).delete()
            deleted_files += main_folder_files[0] if main_folder_files[0] else 0
            
            # Ta bort filer i undermappar
            for dir_id in child_directory_ids:
                files_deleted = File.objects.filter(directory_id=dir_id).delete()
                deleted_files += files_deleted[0] if files_deleted[0] else 0
        except Exception as e:
            print(f"Fel vid radering av filer: {str(e)}")
        
        try:
            # Avmarkera is_sidebar_item flaggan för alla mappar före radering
            Directory.objects.filter(id=directory_id).update(is_sidebar_item=False)
            if child_directory_ids:
                Directory.objects.filter(id__in=child_directory_ids).update(is_sidebar_item=False)
        except Exception as e:
            print(f"Fel vid uppdatering av is_sidebar_item: {str(e)}")
        
        # Radera alla undermappar
        deleted_directories = 0
        try:
            if child_directory_ids:
                delete_result = Directory.objects.filter(id__in=child_directory_ids).delete()
                deleted_directories = delete_result[0] if delete_result[0] else 0
        except Exception as e:
            print(f"Fel vid radering av undermappar: {str(e)}")
        
        # Radera slutligen huvudmappen
        try:
            instance.delete()
        except Exception as e:
            print(f"Fel vid radering av huvudmapp: {str(e)}")
            raise e  # Låt felet propagera vidare
        
        # Returnera detaljerad information om raderingen
        return Response({
            "success": True,
            "message": f"Mappen '{slug_to_delete}' och allt dess innehåll har raderats",
            "details": {
                "deleted_directories": deleted_directories + 1,  # +1 för huvudmappen
                "deleted_files": deleted_files,
                "slug": slug_to_delete,
                "id": directory_id,
                "parent_id": parent_id,
                "parent_slug": parent_slug if parent_id else None
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        # Om något går fel, logga felet och returnera felmeddelande
        import traceback
        print(f"Fel vid radering av mapp: {str(e)}")
        traceback.print_exc()
        return Response({
            "success": False,
            "error": f"Kunde inte radera mappen: {str(e)}"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@api_view(['GET'])
@permission_classes([AllowAny])
def get_file_content(request, file_id):
    """
    API-endpoint för att hämta en PDF-fils innehåll direkt via ID.
    Stödjer strömning av PDF-filer för inline-visning i webbläsare.
    """
    try:
        # Hämta filen från databasen
        file_obj = get_object_or_404(File, id=file_id)
        file_path = file_obj.file.path
        
        # Kontrollera att filen finns på disken
        if not os.path.exists(file_path):
            return Response({"error": "Filen hittades inte på disken"}, status=404)
        
        # Returnera filen som PDF med öppnad filestream
        from django.http import FileResponse
        response = FileResponse(
            open(file_path, 'rb'),
            content_type='application/pdf'
        )
        
        # Sätt headers för korrekt PDF-visning och caching
        response['Content-Disposition'] = f'inline; filename="{file_obj.name}"'
        
        # Förbättrad cachehantering för PDF-filer
        response['Cache-Control'] = 'no-store, must-revalidate, max-age=0'
        response['Pragma'] = 'no-cache'
        response['Expires'] = '0'
        
        # Tillåt embedding i iframe och cross-origin access
        response.headers.pop('X-Frame-Options', None)
        response['Access-Control-Allow-Origin'] = '*'
        
        print(f"Levererar PDF-fil via get_file_content: {file_path}")
        return response
        
    except File.DoesNotExist:
        return Response({"error": "Filen hittades inte i databasen"}, status=404)
    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({"error": str(e)}, status=500)