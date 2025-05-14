from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import FileNode, FileVersion, FileComment, WikiArticle, ProjectDashboard, PDFDocument
from .serializers import (
    FileNodeSerializer, FileVersionSerializer, FileCommentSerializer,
    WikiArticleSerializer, ProjectDashboardSerializer, PDFDocumentSerializer
)
from core.models import Project, RoleAccess

class WorkspacePermission(permissions.BasePermission):
    """
    Custom permission to only allow members of a project to access its workspace.
    """
    def has_permission(self, request, view):
        # Check if user is authenticated
        if not request.user.is_authenticated:
            return False
        
        # For certain views like ProjectDashboard specific endpoints
        if getattr(view, 'no_project_check', False):
            return True
        
        # Check if project_id is in the request
        project_id = request.query_params.get('project')
        if not project_id:
            # Check if it's in the data for create operations
            project_id = request.data.get('project')
            
        if not project_id:
            return False
        
        # Check if user has access to the project
        return RoleAccess.objects.filter(
            user=request.user,
            project_id=project_id
        ).exists()
    
    def has_object_permission(self, request, view, obj):
        # Check if user is a member of the object's project
        project = None
        
        if hasattr(obj, 'project'):
            project = obj.project
        elif hasattr(obj, 'file_node'):
            project = obj.file_node.project
        elif hasattr(obj, 'file_version'):
            project = obj.file_version.file_node.project
            
        if not project:
            return False
            
        return RoleAccess.objects.filter(
            user=request.user,
            project=project
        ).exists()

class FileNodeViewSet(viewsets.ModelViewSet):
    """API endpoint for file nodes (files and folders)"""
    queryset = FileNode.objects.all()
    serializer_class = FileNodeSerializer
    permission_classes = [WorkspacePermission]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['name', 'type', 'created_at', 'updated_at']
    search_fields = ['name']
    
    def get_queryset(self):
        queryset = FileNode.objects.all()
        
        # Filter by project
        project_id = self.request.query_params.get('project')
        if project_id:
            project = get_object_or_404(Project, id=project_id)
            queryset = queryset.filter(project=project)
        
        # Filter by parent
        parent_id = self.request.query_params.get('parent')
        if parent_id:
            if parent_id.lower() == 'null':
                queryset = queryset.filter(parent__isnull=True)
            else:
                queryset = queryset.filter(parent_id=parent_id)
                
        # Filter by type
        node_type = self.request.query_params.get('type')
        if node_type:
            queryset = queryset.filter(type=node_type)
            
        # Search by name
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset

class FileVersionViewSet(viewsets.ModelViewSet):
    """API endpoint for file versions"""
    queryset = FileVersion.objects.all()
    serializer_class = FileVersionSerializer
    permission_classes = [WorkspacePermission]
    
    def get_queryset(self):
        queryset = FileVersion.objects.all()
        
        # Filter by file node
        file_node_id = self.request.query_params.get('file_node')
        if file_node_id:
            file_node = get_object_or_404(FileNode, id=file_node_id)
            queryset = queryset.filter(file_node=file_node)
        
        return queryset

class FileCommentViewSet(viewsets.ModelViewSet):
    """API endpoint for file comments"""
    queryset = FileComment.objects.all()
    serializer_class = FileCommentSerializer
    permission_classes = [WorkspacePermission]
    
    def get_queryset(self):
        queryset = FileComment.objects.all()
        
        # Filter by file version
        file_version_id = self.request.query_params.get('file_version')
        if file_version_id:
            queryset = queryset.filter(file_version_id=file_version_id)
            
        return queryset

class WikiArticleViewSet(viewsets.ModelViewSet):
    """API endpoint for wiki articles"""
    queryset = WikiArticle.objects.all()
    serializer_class = WikiArticleSerializer
    permission_classes = [WorkspacePermission]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['title', 'created_at', 'updated_at']
    search_fields = ['title', 'content']
    
    def get_queryset(self):
        queryset = WikiArticle.objects.all()
        
        # Filter by project
        project_id = self.request.query_params.get('project')
        if project_id:
            project = get_object_or_404(Project, id=project_id)
            queryset = queryset.filter(project=project)
            
        return queryset

class ProjectDashboardViewSet(viewsets.ModelViewSet):
    """API endpoint for project dashboards"""
    queryset = ProjectDashboard.objects.all()
    serializer_class = ProjectDashboardSerializer
    permission_classes = [WorkspacePermission]
    
    def get_queryset(self):
        queryset = ProjectDashboard.objects.all()
        
        # Filter by project
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
            
        return queryset
    
    @action(detail=False, methods=['get'], url_path='for_project')
    def for_project(self, request):
        """Get or create dashboard for a project"""
        project_id = request.query_params.get('project')
        if not project_id:
            return Response({'error': 'Project ID is required'}, status=status.HTTP_400_BAD_REQUEST)
            
        # Check if user has access to the project
        has_access = RoleAccess.objects.filter(
            user=request.user,
            project_id=project_id
        ).exists()
        
        if not has_access:
            return Response({'error': 'You do not have access to this project'}, status=status.HTTP_403_FORBIDDEN)
            
        # Get or create dashboard
        dashboard, created = ProjectDashboard.objects.get_or_create(
            project_id=project_id,
            defaults={
                'welcome_message': 'Welcome to your project dashboard!',
                'show_recent_files': True,
                'show_recent_wiki': True,
                'show_team_activity': True
            }
        )
        
        serializer = self.get_serializer(dashboard)
        return Response(serializer.data)

class PDFDocumentViewSet(viewsets.ModelViewSet):
    """API endpoint for PDF documents"""
    queryset = PDFDocument.objects.all()
    serializer_class = PDFDocumentSerializer
    permission_classes = [WorkspacePermission]
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['title', 'created_at', 'updated_at']
    search_fields = ['title', 'description']
    
    def get_queryset(self):
        queryset = PDFDocument.objects.all()
        
        # Filter by project
        project_id = self.request.query_params.get('project')
        if project_id:
            project = get_object_or_404(Project, id=project_id)
            queryset = queryset.filter(project=project)
            
        return queryset