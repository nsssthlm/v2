from django.db import models
from django.conf import settings
from core.models import Project

class WikiArticle(models.Model):
    """Model for wiki articles related to projects"""
    title = models.CharField(max_length=255)
    content = models.TextField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='wiki_articles')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_articles')
    last_edited_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='edited_articles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='children')
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        unique_together = ('title', 'project')
        ordering = ['order', 'title']
    
    def __str__(self):
        return self.title
