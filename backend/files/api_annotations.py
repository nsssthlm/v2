from rest_framework import viewsets, permissions, status, filters
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import PDFAnnotation, File
from .serializers import PDFAnnotationSerializer


class PDFAnnotationViewSet(viewsets.ModelViewSet):
    """ViewSet för att hantera PDF-annotationer"""
    serializer_class = PDFAnnotationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['comment', 'status']
    ordering_fields = ['created_at', 'updated_at', 'page_number']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = PDFAnnotation.objects.all()
        
        # Filtrera efter fil-id om angett
        file_id = self.request.query_params.get('file_id')
        if file_id:
            queryset = queryset.filter(file_id=file_id)
            
        # Filtrera efter projekt-id om angett
        project_id = self.request.query_params.get('project_id')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        # Filtrera efter status om angett
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
            
        # Filtrera efter sidnummer om angett
        page_number = self.request.query_params.get('page_number')
        if page_number:
            queryset = queryset.filter(page_number=page_number)
            
        return queryset