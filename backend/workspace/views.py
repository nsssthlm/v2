from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import FileNode, FileVersion, FileComment, WikiArticle, ProjectDashboard, PDFDocument
from .serializers import (
    FileNodeSerializer, FileVersionSerializer, FileCommentSerializer,
    WikiArticleSerializer, ProjectDashboardSerializer, PDFDocumentSerializer
)
from core.models import RoleAccess, Project


class IsProjectMemberOrReadOnly(permissions.BasePermission):
    """
    Permission to only allow members of a project to edit objects.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        project_id = request.data.get('project')
        if not project_id:
            return False
        
        return RoleAccess.objects.filter(
            user=request.user,
            project_id=project_id
        ).exists()
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return RoleAccess.objects.filter(
                user=request.user,
                project=obj.project
            ).exists()
        
        # Write permissions for project members
        return RoleAccess.objects.filter(
            user=request.user,
            project=obj.project
        ).exists()


class FileNodeViewSet(viewsets.ModelViewSet):
    queryset = FileNode.objects.all()
    serializer_class = FileNodeSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMemberOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    ordering_fields = ['name', 'created_at', 'updated_at']
    
    def get_queryset(self):
        user = self.request.user
        accessible_projects = Project.objects.filter(
            user_roles__user=user
        ).values_list('id', flat=True)
        
        queryset = FileNode.objects.filter(project__id__in=accessible_projects)
        
        # Filter by project if specified
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project__id=project_id)
        
        # Filter by parent if specified (or root level)
        parent_id = self.request.query_params.get('parent')
        if parent_id and parent_id.lower() != 'null':
            queryset = queryset.filter(parent__id=parent_id)
        elif parent_id and parent_id.lower() == 'null':
            queryset = queryset.filter(parent__isnull=True)
            
        # Filter by type
        node_type = self.request.query_params.get('type')
        if node_type:
            queryset = queryset.filter(type=node_type)
            
        return queryset
    
    @action(detail=True, methods=['get'])
    def children(self, request, pk=None):
        """Get all children of a node"""
        node = self.get_object()
        children = FileNode.objects.filter(parent=node)
        serializer = self.get_serializer(children, many=True)
        return Response(serializer.data)


class FileVersionViewSet(viewsets.ModelViewSet):
    queryset = FileVersion.objects.all()
    serializer_class = FileVersionSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMemberOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        accessible_projects = Project.objects.filter(
            user_roles__user=user
        ).values_list('id', flat=True)
        
        queryset = FileVersion.objects.filter(file_node__project__id__in=accessible_projects)
        
        # Filter by file_node if specified
        file_node_id = self.request.query_params.get('file_node')
        if file_node_id:
            queryset = queryset.filter(file_node__id=file_node_id)
            
        return queryset


class FileCommentViewSet(viewsets.ModelViewSet):
    queryset = FileComment.objects.all()
    serializer_class = FileCommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMemberOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        accessible_projects = Project.objects.filter(
            user_roles__user=user
        ).values_list('id', flat=True)
        
        queryset = FileComment.objects.filter(
            file_version__file_node__project__id__in=accessible_projects
        )
        
        # Filter by file_version if specified
        file_version_id = self.request.query_params.get('file_version')
        if file_version_id:
            queryset = queryset.filter(file_version__id=file_version_id)
            
        return queryset


class WikiArticleViewSet(viewsets.ModelViewSet):
    queryset = WikiArticle.objects.all()
    serializer_class = WikiArticleSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMemberOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['title', 'created_at', 'updated_at']
    
    def get_queryset(self):
        user = self.request.user
        accessible_projects = Project.objects.filter(
            user_roles__user=user
        ).values_list('id', flat=True)
        
        queryset = WikiArticle.objects.filter(project__id__in=accessible_projects)
        
        # Filter by project if specified
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project__id=project_id)
            
        return queryset


class ProjectDashboardViewSet(viewsets.ModelViewSet):
    queryset = ProjectDashboard.objects.all()
    serializer_class = ProjectDashboardSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMemberOrReadOnly]
    
    def get_queryset(self):
        user = self.request.user
        accessible_projects = Project.objects.filter(
            user_roles__user=user
        ).values_list('id', flat=True)
        
        return ProjectDashboard.objects.filter(project__id__in=accessible_projects)
    
    @action(detail=False, methods=['get'])
    def for_project(self, request):
        """Get dashboard for a specific project, create if it doesn't exist"""
        project_id = request.query_params.get('project')
        if not project_id:
            return Response(
                {"error": "Project ID is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user has access to the project
        if not RoleAccess.objects.filter(user=request.user, project_id=project_id).exists():
            return Response(
                {"error": "You don't have access to this project"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get or create dashboard
        dashboard, created = ProjectDashboard.objects.get_or_create(
            project_id=project_id,
            defaults={
                "welcome_message": "Welcome to your project workspace!"
            }
        )
        
        serializer = self.get_serializer(dashboard)
        return Response(serializer.data)


class PDFDocumentViewSet(viewsets.ModelViewSet):
    queryset = PDFDocument.objects.all()
    serializer_class = PDFDocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsProjectMemberOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at', 'updated_at']
    
    def get_queryset(self):
        user = self.request.user
        accessible_projects = Project.objects.filter(
            user_roles__user=user
        ).values_list('id', flat=True)
        
        queryset = PDFDocument.objects.filter(project__id__in=accessible_projects)
        
        # Filter by project if specified
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project__id=project_id)
            
        return queryset