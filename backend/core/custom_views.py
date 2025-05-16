from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from django.utils import timezone
from .models import Project
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
@require_http_methods(["POST"])
def create_project(request):
    """
    Skapa ett nytt projekt utan autentisering.
    Endast för utvecklingssyfte.
    
    Request body förväntas innehålla:
    {
        "name": "Projektnamn",
        "description": "Projektbeskrivning",
        "start_date": "YYYY-MM-DD",
        "end_date": "YYYY-MM-DD" (optional)
    }
    """
    try:
        data = json.loads(request.body)
        
        # Validera nödvändiga fält
        if not data.get('name'):
            return JsonResponse({"error": "Projektnamn saknas"}, status=400)
        
        if not data.get('start_date'):
            data['start_date'] = timezone.now().date().isoformat()
            
        # Skapa nytt projekt
        project = Project.objects.create(
            name=data['name'],
            description=data.get('description', ''),
            start_date=data['start_date'],
            end_date=data.get('end_date'),
            is_active=True
        )
        
        # Spara och returnera projektet
        project.save()
        
        # Returnera projektobjekt med ID
        # Hantera start_date och end_date korrekt - de kan vara strängar eller datum
        start_date = project.start_date
        if not isinstance(start_date, str):
            start_date = start_date.isoformat()
            
        end_date = project.end_date
        if end_date and not isinstance(end_date, str):
            end_date = end_date.isoformat()
        
        return JsonResponse({
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "start_date": start_date,
            "end_date": end_date,
            "is_active": project.is_active
        })
        
    except json.JSONDecodeError:
        return JsonResponse({"error": "Ogiltig JSON-data"}, status=400)
    except Exception as e:
        logger.exception("Fel vid skapande av projekt: %s", str(e))
        return JsonResponse({"error": str(e)}, status=500)