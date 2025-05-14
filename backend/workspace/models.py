from django.db import models
from django.conf import settings
from core.models import Project

class FileNode(models.Model):
    """Model for files and folders in project workspace"""
    FILE = 'file'
    FOLDER = 'folder'
    
    TYPE_CHOICES = [
        (FILE, 'File'),
        (FOLDER, 'Folder'),
    ]
    
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='file_nodes')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_files')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('name', 'project', 'parent')
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    def get_path(self):
        """Get full path of the file or folder"""
        if self.parent_id:
            parent_path = ""
            if hasattr(self.parent, 'get_path'):
                parent_path = self.parent.get_path()
            return f"{parent_path}/{self.name}"
        return self.name

class FileVersion(models.Model):
    """Model for file versions"""
    file_node = models.ForeignKey(FileNode, on_delete=models.CASCADE, related_name='versions')
    version = models.IntegerField(default=1)
    file = models.FileField(upload_to='files/%Y/%m/%d/')
    content_type = models.CharField(max_length=100)
    size = models.IntegerField()
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_versions')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('file_node', 'version')
        ordering = ['-version']
    
    def __str__(self):
        return f"{self.file_node.name} (v{self.version})"
    
    def save(self, *args, **kwargs):
        # Auto-increment version
        if not self.pk:
            last_version = FileVersion.objects.filter(file_node=self.file_node).order_by('-version').first()
            self.version = (last_version.version + 1) if last_version else 1
        super().save(*args, **kwargs)

class FileComment(models.Model):
    """Model for comments on file versions"""
    file_version = models.ForeignKey(FileVersion, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='file_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        user_str = str(self.user)
        file_version_str = str(self.file_version)
        return f"Comment by {user_str} on {file_version_str}"

class WikiArticle(models.Model):
    """Model for wiki articles"""
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
        return self.title

class ProjectDashboard(models.Model):
    """Model for customizable project dashboard settings"""
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='dashboard')
    welcome_message = models.TextField(blank=True)
    show_recent_files = models.BooleanField(default=True)
    show_recent_wiki = models.BooleanField(default=True)
    show_team_activity = models.BooleanField(default=True)
    custom_config = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Dashboard for {self.project.name}"

class PDFDocument(models.Model):
    """Model for PDF documents"""
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='pdfs/%Y/%m/%d/')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='pdf_documents')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_pdfs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title