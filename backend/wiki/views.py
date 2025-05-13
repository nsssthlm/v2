from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import WikiArticle
from .serializers import WikiArticleSerializer
from core.models import Project, RoleAccess

class WikiArticleViewSet(viewsets.ModelViewSet):
    queryset = WikiArticle.objects.all()
    serializer_class = WikiArticleSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['title', 'created_at', 'updated_at', 'order']
    
    def get_queryset(self):
        """Filter wiki articles by project"""
        queryset = WikiArticle.objects.all()
        
        # Filter by project (required)
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by parent article (optional)
        parent_id = self.request.query_params.get('parent')
        if parent_id and parent_id != 'null':
            queryset = queryset.filter(parent_id=parent_id)
        elif parent_id == 'null':
            queryset = queryset.filter(parent__isnull=True)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def tree(self, request, pk=None):
        """Get a article and all its children in a tree structure"""
        article = self.get_object()
        serializer = self.get_serializer(article)
        
        result = serializer.data
        children = WikiArticle.objects.filter(parent=article).order_by('order', 'title')
        
        # Recursively get children
        if children.exists():
            result['children'] = []
            for child in children:
                child_viewset = self.__class__(
                    request=request,
                    format_kwarg=self.format_kwarg,
                )
                child_viewset.kwargs = {'pk': child.pk}
                result['children'].append(child_viewset.tree(request).data)
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def full_tree(self, request):
        """Get the entire wiki structure for a project"""
        project_id = request.query_params.get('project')
        if not project_id:
            return Response({"error": "Project ID is required"}, status=400)
        
        # Get all root articles for the project
        root_articles = WikiArticle.objects.filter(
            project_id=project_id,
            parent__isnull=True
        ).order_by('order', 'title')
        
        result = []
        for article in root_articles:
            article_viewset = self.__class__(
                request=request,
                format_kwarg=self.format_kwarg,
            )
            article_viewset.kwargs = {'pk': article.pk}
            result.append(article_viewset.tree(request).data)
        
        return Response(result)
