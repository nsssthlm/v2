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
    
    Denna funktion är specifikt designad för att lösa problem med PDF-visning i frontend
    via Replit-proxyn, där Content-Type ibland går förlorad.
    """
    from django.http import HttpResponse, Http404, FileResponse
    import os
    import mimetypes
    from django.conf import settings
    
    # Säkerställ att filsökvägen inte innehåller några farliga komponenter
    if '..' in file_path:
        raise Http404("Ogiltig filsökväg")
    
    # Hantera OPTIONS-anrop för CORS preflight requests
    if request.method == 'OPTIONS':
        response = HttpResponse()
        response['Allow'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization'
        return response
    
    try:
        # Konstruera fullständig sökväg till filen
        # Ta bort eventuellt avslutande / (förväntas i URL-mönstret men inte i filsystemet)
        clean_path = file_path.rstrip('/')
        full_path = os.path.join(settings.MEDIA_ROOT, clean_path)
        
        # Logga för felsökning
        print(f"Försöker hitta PDF-fil: {full_path}")
        print(f"MEDIA_ROOT: {settings.MEDIA_ROOT}")
        print(f"Begärd sökväg: {file_path}")
        
        # Kontrollera att filen existerar och är läsbar
        if not os.path.exists(full_path) or not os.path.isfile(full_path):
            print(f"PDF-fil hittades inte: {full_path}")
            raise Http404("Filen hittades inte")
        
        # Kontrollera att det verkligen är en PDF-fil
        if not full_path.lower().endswith('.pdf'):
            print(f"Begärd fil är inte en PDF: {full_path}")
            return HttpResponse(b"Endast PDF-filer stods via denna endpoint", status=400, content_type='text/plain')
        
        # För HEAD-förfrågningar, returnera bara headers
        if request.method == 'HEAD':
            response = HttpResponse(content_type='application/pdf')
            response['Content-Length'] = os.path.getsize(full_path)
            response['Accept-Ranges'] = 'bytes'
            response['Content-Disposition'] = f'inline; filename="{os.path.basename(full_path)}"'
            response['Access-Control-Allow-Origin'] = '*'
            return response
            
        # Använd FileResponse för bättre strömning av filer
        response = FileResponse(
            open(full_path, 'rb'),
            content_type='application/pdf',
            as_attachment=False,
            filename=os.path.basename(full_path)
        )
            
        # Lägg till kritiska headers för PDF-visning
        response['Content-Disposition'] = f'inline; filename="{os.path.basename(full_path)}"'
        
        # Tillåt innehållsdelning från alla domäner för CORS
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, HEAD, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Accept, Authorization'
        
        # Ta bort headers som kan störa PDF-visning
        if 'X-Frame-Options' in response:
            del response['X-Frame-Options']
            
        # Debugging av headers
        print(f"Serving PDF from media: {full_path}")
        print(f"Content-Type: {response['Content-Type']}")
        print(f"Content-Length: {response.get('Content-Length', 'unknown')}")
        
        return response
    
    except Http404:
        raise  # Skicka vidare 404-fel
    except Exception as e:
        import traceback
        print(f"Fel vid servering av PDF: {str(e)}")
        traceback.print_exc()
        return HttpResponse(f"Fel vid läsning av PDF: {str(e)}".encode('utf-8'), status=500, content_type='text/plain')

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