from django.urls import path
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(['GET'])
def pdf_content(request, id):
    """
    Denna funktion är inaktiverad - all PDF-funktionalitet har tagits bort.
    """
    return Response({"message": "PDF functionality has been removed"}, status=404)

def register_pdf_api_routes(router=None):
    """
    Detta returnerar nu en tom lista eftersom PDF-funktionaliteten har tagits bort.
    """
    return []