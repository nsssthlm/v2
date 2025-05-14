from django.db import models
from django.conf import settings
from core.models import Project, User

class FileNode(models.Model):
    """Model for representing a file or folder in the project file structure"""
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
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_file_nodes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('name', 'project', 'parent')
        ordering = ['type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"
    
    def get_path(self):
        """Return the full path of the file node"""
        if self.parent:
            return f"{self.parent.get_path()}/{self.name}"
        return f"/{self.name}"

class FileVersion(models.Model):
    """Model for storing versions of files"""
    file_node = models.ForeignKey(FileNode, on_delete=models.CASCADE, related_name='versions')
    version = models.PositiveIntegerField()
    file = models.FileField(upload_to='workspace_files/%Y/%m/%d/')
    content_type = models.CharField(max_length=100)
    size = models.BigIntegerField()  # Size in bytes
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_file_versions')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('file_node', 'version')
        ordering = ['-version']
    
    def __str__(self):
        return f"{self.file_node.name} v{self.version}"
    
    @property
    def file_url(self):
        """Return the URL to access the file"""
        return self.file.url

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
        return f"Comment by {self.user.username} on {self.file_version}"

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
    file = models.FileField(upload_to='pdf_documents/%Y/%m/%d/')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='pdf_documents')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_pdf_documents')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title
    
    @property
    def file_url(self):
        """Return the URL to access the PDF file"""
        return self.file.url