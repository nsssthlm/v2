from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.views.decorators.clickjacking import xframe_options_exempt
from django.utils.decorators import method_decorator
from core.models import Project, RoleAccess
from .models import FileNode, FileVersion, FileComment, WikiArticle, ProjectDashboard, PDFDocument
from .serializers import (
    FileNodeSerializer, FileVersionSerializer, FileCommentSerializer,
    WikiArticleSerializer, ProjectDashboardSerializer, PDFDocumentSerializer
)

# Custom permissions
class HasProjectPermission(permissions.BasePermission):
    """
    Custom permission to check if user has access to the project.
    """
    def has_permission(self, request, view):
        # Allow read access to authenticated users for list views
        if request.method in permissions.SAFE_METHODS and request.user.is_authenticated:
            # For list requests, filtering will be applied in the queryset
            return True
        
        # For create operations, check if project_id is provided
        if request.method == 'POST' and request.user.is_authenticated:
            project_id = request.data.get('project')
            if project_id:
                return RoleAccess.objects.filter(
                    user=request.user,
                    project_id=project_id
                ).exists()
            
        return False

    def has_object_permission(self, request, view, obj):
        # Get the project from the object
        if hasattr(obj, 'project'):
            project = obj.project
        elif hasattr(obj, 'file_node'):
            project = obj.file_node.project
        else:
            return False
        
        # Check if user has role access to this project
        return RoleAccess.objects.filter(
            user=request.user,
            project=project
        ).exists()

# API Views
class FileNodeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for file nodes (files and folders)
    """
    serializer_class = FileNodeSerializer
    permission_classes = [permissions.IsAuthenticated, HasProjectPermission]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']
    
    def get_queryset(self):
        user = self.request.user
        # Get all projects that the user has access to
        project_ids = RoleAccess.objects.filter(user=user).values_list('project_id', flat=True)
        # Return all file nodes from these projects
        return FileNode.objects.filter(project_id__in=project_ids)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Filter by project if specified
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        # Filter by parent if specified
        parent_id = self.request.query_params.get('parent', None)
        if parent_id:
            if parent_id.lower() == 'null':
                queryset = queryset.filter(parent__isnull=True)
            else:
                queryset = queryset.filter(parent_id=parent_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class FileVersionViewSet(viewsets.ModelViewSet):
    """
    API endpoint for file versions
    """
    serializer_class = FileVersionSerializer
    permission_classes = [permissions.IsAuthenticated, HasProjectPermission]
    
    def get_queryset(self):
        user = self.request.user
        # Get all projects that the user has access to
        project_ids = RoleAccess.objects.filter(user=user).values_list('project_id', flat=True)
        # Return all file versions from file nodes in these projects
        return FileVersion.objects.filter(file_node__project_id__in=project_ids)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Filter by file node if specified
        file_node_id = self.request.query_params.get('file_node', None)
        if file_node_id:
            queryset = queryset.filter(file_node_id=file_node_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class FileCommentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for file comments
    """
    serializer_class = FileCommentSerializer
    permission_classes = [permissions.IsAuthenticated, HasProjectPermission]
    
    def get_queryset(self):
        user = self.request.user
        # Get all projects that the user has access to
        project_ids = RoleAccess.objects.filter(user=user).values_list('project_id', flat=True)
        # Return all comments from file nodes in these projects
        return FileComment.objects.filter(file_node__project_id__in=project_ids)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Filter by file node if specified
        file_node_id = self.request.query_params.get('file_node', None)
        if file_node_id:
            queryset = queryset.filter(file_node_id=file_node_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class WikiArticleViewSet(viewsets.ModelViewSet):
    """
    API endpoint for wiki articles
    """
    serializer_class = WikiArticleSerializer
    permission_classes = [permissions.IsAuthenticated, HasProjectPermission]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'content']
    
    def get_queryset(self):
        user = self.request.user
        # Get all projects that the user has access to
        project_ids = RoleAccess.objects.filter(user=user).values_list('project_id', flat=True)
        # By default, return only published articles that are not archived
        queryset = WikiArticle.objects.filter(
            project_id__in=project_ids,
            is_published=True,
            is_archived=False
        )
        
        # Admin users can see all articles including unpublished and archived
        if self.request.query_params.get('show_all', 'false').lower() == 'true':
            role_in_projects = RoleAccess.objects.filter(
                user=user, 
                role__in=[RoleAccess.PROJECT_LEADER, RoleAccess.MEMBER]
            ).values_list('project_id', flat=True)
            
            # For projects where the user is a leader or member, show all articles
            # For others, show only published non-archived
            queryset = WikiArticle.objects.filter(
                Q(project_id__in=role_in_projects) |
                Q(project_id__in=project_ids, is_published=True, is_archived=False)
            ).distinct()
            
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Filter by project if specified
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        # Filter by parent if needed
        parent_id = self.request.query_params.get('parent', None)
        if parent_id:
            if parent_id.lower() == 'null':
                queryset = queryset.filter(parent__isnull=True)
            else:
                queryset = queryset.filter(parent_id=parent_id)
        
        # Get index article if requested
        is_index = self.request.query_params.get('is_index', None)
        if is_index and is_index.lower() == 'true':
            queryset = queryset.filter(is_index=True)
            
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class ProjectDashboardViewSet(viewsets.ModelViewSet):
    """
    API endpoint for project dashboards
    """
    serializer_class = ProjectDashboardSerializer
    permission_classes = [permissions.IsAuthenticated, HasProjectPermission]
    
    def get_queryset(self):
        user = self.request.user
        # Get all projects that the user has access to
        project_ids = RoleAccess.objects.filter(user=user).values_list('project_id', flat=True)
        # Return dashboards for these projects
        return ProjectDashboard.objects.filter(project_id__in=project_ids)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Filter by project if specified
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def for_project(self, request):
        """
        Get or create dashboard for a specific project
        """
        project_id = request.query_params.get('project')
        if not project_id:
            return Response({"error": "Project ID is required"}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if user has access to the project
        if not RoleAccess.objects.filter(user=request.user, project_id=project_id).exists():
            return Response({"error": "You don't have access to this project"}, status=status.HTTP_403_FORBIDDEN)
            
        # Get or create dashboard
        project = get_object_or_404(Project, id=project_id)
        dashboard, created = ProjectDashboard.objects.get_or_create(
            project=project,
            defaults={'content': {}}
        )
        
        serializer = self.get_serializer(dashboard)
        return Response(serializer.data)

class PDFDocumentViewSet(viewsets.ModelViewSet):
    """
    API endpoint for PDF documents
    """
    serializer_class = PDFDocumentSerializer
    permission_classes = [permissions.IsAuthenticated, HasProjectPermission]
    filter_backends = [filters.SearchFilter]
    search_fields = ['title', 'description']
    
    def get_queryset(self):
        user = self.request.user
        # Get all projects that the user has access to
        project_ids = RoleAccess.objects.filter(user=user).values_list('project_id', flat=True)
        # Return all PDFs from these projects
        return PDFDocument.objects.filter(project_id__in=project_ids)
    
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        
        # Filter by project if specified
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
        
    @action(detail=True, methods=['get'])
    @method_decorator(xframe_options_exempt)
    def content(self, request, pk=None):
        """
        Get PDF content with headers that exempt it from X-Frame-Options restrictions
        
        Supports both session-based authentication and token-based authentication
        via a 'token' query parameter for direct access from PDF.js or iframe.
        """
        # Om token finns i query params, validera och autentisera användaren
        token = request.query_params.get('token')
        if token and not request.user.is_authenticated:
            # Importera JWT-verifiering
            from rest_framework_simplejwt.tokens import AccessToken
            from rest_framework_simplejwt.exceptions import TokenError
            from django.contrib.auth import get_user_model
            
            User = get_user_model()
            
            try:
                # Validera token och hämta användar-ID
                token_obj = AccessToken(token)
                user_id = token_obj['user_id']
                
                # Hämta användaren
                user = User.objects.get(id=user_id)
                # Sätt användaren på request-objektet
                request.user = user
                print(f"Authenticated user {user.username} via token")
            except (TokenError, User.DoesNotExist) as e:
                print(f"Token authentication failed: {str(e)}")
                # Token är ogiltig eller användaren finns inte
                # Fortsätt utan autentisering, permission check kommer att hantera det
                pass
        
        # Tillåt autentiserade användare att hämta PDF
        self.permission_classes = [permissions.IsAuthenticated]
        
        try:
            pdf = self.get_object()
        except Exception as e:
            return Response({"error": f"Kunde inte hämta PDF: {str(e)}"}, status=404)
            
        from django.http import FileResponse
        import os
        
        # Lägg till extra säkerhet på filhantering
        if not os.path.exists(pdf.file.path):
            return Response({"error": "File not found"}, status=404)
        
        # Använd FileResponse för att hantera filer effektivt
        response = FileResponse(
            open(pdf.file.path, 'rb'),
            content_type='application/pdf',
            as_attachment=False
        )
        
        # Säkerställ att X-Frame-Options inte sätts (tillåt embedding överallt)
        response['X-Frame-Options'] = 'ALLOWALL'
        
        # Lägg till Content-Disposition header för att säkerställa inline-visning
        response['Content-Disposition'] = f'inline; filename="{pdf.title}.pdf"'
        
        # Sätt CORS-headers för att tillåta åtkomst från frontend
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        
        # Tillåt embedding i iframe från alla domäner
        response['Content-Security-Policy'] = 'frame-ancestors *'
        
        # Hjälp webbläsare att tolka innehållet korrekt
        response['Content-Type'] = 'application/pdf'
        
        return response