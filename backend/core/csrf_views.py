from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def get_csrf_token(request):
    """
    En enkel vy som sätter CSRF-cookie genom att använda @ensure_csrf_cookie dekoratören.
    Detta används för att säkerställa att CSRF-cookie finns när frontend gör POST/PUT/DELETE-anrop.
    """
    return JsonResponse({"detail": "CSRF cookie set"})