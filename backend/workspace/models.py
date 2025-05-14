from django.db import models
from django.conf import settings
from core.models import Project, User, RoleAccess

class FileNode(models.Model):
    """File node model for workspace tree structure (folders/files)"""
    FOLDER = 'folder'
    FILE = 'file'
    
    TYPE_CHOICES = [
        (FOLDER, 'Folder'),
        (FILE, 'File'),
    ]
    
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES, default=FILE)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='workspace_nodes')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_nodes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('name', 'project', 'parent')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
    
    def get_path(self):
        """Return the full path of the node"""
        if self.parent:
            return f"{self.parent.get_path()}/{self.name}"
        return self.name


class FileVersion(models.Model):
    """File version model for tracking version history"""
    file_node = models.ForeignKey(FileNode, on_delete=models.CASCADE, related_name='versions')
    file = models.FileField(upload_to='workspace_files/%Y/%m/%d/')
    version_number = models.PositiveIntegerField()
    content_type = models.CharField(max_length=100)
    size = models.BigIntegerField()  # Size in bytes
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_versions')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('file_node', 'version_number')
        ordering = ['-version_number']
    
    def __str__(self):
        return f"{self.file_node.name} (v{self.version_number})"


class FileComment(models.Model):
    """Comment model for file versions"""
    file_version = models.ForeignKey(FileVersion, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='file_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment on {self.file_version} by {self.user.username}"


class WikiArticle(models.Model):
    """Wiki article model for project documentation"""
    title = models.CharField(max_length=255)
    content = models.TextField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='workspace_wiki_articles')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workspace_created_wiki_articles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('title', 'project')
        ordering = ['title']
    
    def __str__(self):
        return f"{self.title} - {self.project.name}"


class ProjectDashboard(models.Model):
    """Project dashboard model for customized views"""
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='dashboard')
    welcome_message = models.TextField(blank=True)
    show_recent_files = models.BooleanField(default=True)
    show_recent_wiki = models.BooleanField(default=True)
    show_team_activity = models.BooleanField(default=True)
    custom_config = models.JSONField(blank=True, null=True)
    
    def __str__(self):
        return f"Dashboard for {self.project.name}"


class PDFDocument(models.Model):
    """PDF document model"""
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='workspace_pdfs/%Y/%m/%d/')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='pdf_documents')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_pdfs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title