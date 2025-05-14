from django.db import models
from django.conf import settings
from core.models import Project, User

class FileNode(models.Model):
    """
    Represents a file or folder in the project file system
    """
    FOLDER = 'folder'
    FILE = 'file'
    TYPE_CHOICES = [
        (FOLDER, 'Folder'),
        (FILE, 'File'),
    ]
    
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='children')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='file_nodes')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_nodes')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    def get_path(self):
        """
        Return the full path of the node
        """
        path = [self.name]
        parent = self.parent
        
        while parent:
            path.insert(0, parent.name)
            parent = parent.parent
            
        return '/' + '/'.join(path)

class FileVersion(models.Model):
    """
    Represents a specific version of a file
    """
    file_node = models.ForeignKey(FileNode, on_delete=models.CASCADE, related_name='versions')
    file = models.FileField(upload_to='project_files/%Y/%m/%d/', null=True, blank=True)
    version = models.PositiveIntegerField(default=1)
    content_type = models.CharField(max_length=100)
    size = models.BigIntegerField()  # Size in bytes
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_versions')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-version']
    
    def __str__(self):
        return f"{self.file_node.name} (v{self.version})"
    
    def save(self, *args, **kwargs):
        # Auto-increment version number for new file versions
        if not self.pk:
            last_version = FileVersion.objects.filter(file_node=self.file_node).order_by('-version').first()
            if last_version:
                self.version = last_version.version + 1
                
        super().save(*args, **kwargs)

class FileComment(models.Model):
    """
    Represents a comment on a file
    """
    file_node = models.ForeignKey(FileNode, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='file_comments')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Comment on {self.file_node.name} by {self.created_by.username}"

class WikiArticle(models.Model):
    """
    Represents a wiki article for a project
    """
    title = models.CharField(max_length=255)
    content = models.TextField()
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='workspace_wiki_articles')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, related_name='children')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='workspace_wiki_articles')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=True)
    is_index = models.BooleanField(default=False)  # Is this the main index page?
    is_archived = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['title']
        
    def __str__(self):
        return self.title

class ProjectDashboard(models.Model):
    """
    Represents dashboard configuration for a project
    """
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='dashboard')
    content = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Dashboard for {self.project.name}"

class PDFDocument(models.Model):
    """
    Represents a PDF document in the project
    """
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='pdf_documents/%Y/%m/%d/')
    content_type = models.CharField(max_length=100, default='application/pdf')
    size = models.BigIntegerField()  # Size in bytes
    version = models.PositiveIntegerField(default=1)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='pdf_documents')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='uploaded_pdfs')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return self.title
    
    @property
    def file_url(self):
        """Return the URL to the PDF file"""
        return self.file.url if self.file else None