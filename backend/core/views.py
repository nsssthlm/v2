from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import models
from django.contrib.auth import authenticate
from .models import User, Project, Task, RoleAccess, TimeReport
from .serializers import (
    UserSerializer, UserCreateSerializer, ProjectSerializer,
    TaskSerializer, RoleAccessSerializer, TimeReportSerializer
)

class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner
        return obj.user == request.user

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    
    def get_queryset(self):
        """
        This view should return a list of all projects
        for the currently authenticated user.
        """
        user = self.request.user
        return Project.objects.filter(users=user)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    
    def get_queryset(self):
        """
        Optionally restricts the returned tasks to a given project,
        by filtering against a `project` query parameter in the URL.
        """
        queryset = Task.objects.all()
        project = self.request.query_params.get('project', None)
        if project is not None:
            queryset = queryset.filter(project__id=project)
        return queryset

class RoleAccessViewSet(viewsets.ModelViewSet):
    queryset = RoleAccess.objects.all()
    serializer_class = RoleAccessSerializer
    
    def get_queryset(self):
        """
        This view should return a list of all roles
        for the currently authenticated user.
        """
        user = self.request.user
        # If user is superuser, return all roles
        if user.is_superuser:
            return RoleAccess.objects.all()
        # Return roles where user is project leader
        return RoleAccess.objects.filter(
            project__in=Project.objects.filter(
                user_roles__user=user,
                user_roles__role=RoleAccess.PROJECT_LEADER
            )
        )

class TimeReportViewSet(viewsets.ModelViewSet):
    queryset = TimeReport.objects.all()
    serializer_class = TimeReportSerializer
    
    def get_queryset(self):
        """
        This view should return time reports based on user permissions.
        """
        user = self.request.user
        # If user is superuser, return all time reports
        if user.is_superuser:
            return TimeReport.objects.all()
        
        # Get all projects where user is a project leader
        leader_projects = Project.objects.filter(
            user_roles__user=user,
            user_roles__role=RoleAccess.PROJECT_LEADER
        )
        
        # Return time reports for user's own entries or for projects they lead
        return TimeReport.objects.filter(
            models.Q(user=user) | models.Q(task__project__in=leader_projects)
        )
        
class ProjectSampleViewSet(viewsets.ViewSet):
    """
    ViewSet for providing sample project data for testing and development.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        """Return a sample list of projects"""
        sample_data = [
            {
                "id": 1,
                "name": "Office Building A",
                "description": "10-story office building with underground parking",
                "start_date": "2025-01-15",
                "end_date": "2026-07-30",
                "is_active": True,
                "tasks_count": 24,
                "files_count": 15,
                "team_size": 8
            },
            {
                "id": 2,
                "name": "Residential Complex B",
                "description": "Mixed-use residential development with retail spaces",
                "start_date": "2025-03-10",
                "end_date": "2027-02-28",
                "is_active": True,
                "tasks_count": 36,
                "files_count": 22,
                "team_size": 12
            },
            {
                "id": 3,
                "name": "Hospital Renovation C",
                "description": "Modernization of existing hospital facilities",
                "start_date": "2024-11-05",
                "end_date": "2025-12-15",
                "is_active": True,
                "tasks_count": 18,
                "files_count": 10,
                "team_size": 6
            }
        ]
        return Response(sample_data)


class LoginView(APIView):
    """
    API view for user login using JWT tokens
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        user = authenticate(username=username, password=password)
        
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user).data
            })
        return Response({'detail': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    """
    API view for user logout (blacklisting JWT token)
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class UserMeView(APIView):
    """
    API view to get current user information
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
