from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    """Custom user model for ValvX platform"""
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(max_length=15, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    two_factor_enabled = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    objects = UserManager()
    
    def __str__(self):
        return self.email

class RoleAccess(models.Model):
    """Defines role-based access for users in projects"""
    PROJECT_LEADER = 'project_leader'
    MEMBER = 'member'
    GUEST = 'guest'
    
    ROLE_CHOICES = [
        (PROJECT_LEADER, 'Project Leader'),
        (MEMBER, 'Member'),
        (GUEST, 'Guest'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='roles')
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='user_roles')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=GUEST)
    
    class Meta:
        unique_together = ('user', 'project')
        
    def __str__(self):
        return f"{self.user.username} - {self.project.name} - {self.role}"

class Project(models.Model):
    """Project model containing basic project information"""
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    users = models.ManyToManyField(User, through=RoleAccess, related_name='projects')
    
    def __str__(self):
        return self.name

class Task(models.Model):
    """Task model for project tasks"""
    TODO = 'todo'
    IN_PROGRESS = 'in_progress'
    REVIEW = 'review'
    DONE = 'done'
    
    STATUS_CHOICES = [
        (TODO, 'To Do'),
        (IN_PROGRESS, 'In Progress'),
        (REVIEW, 'Review'),
        (DONE, 'Done'),
    ]
    
    LOW = 'low'
    MEDIUM = 'medium'
    HIGH = 'high'
    
    PRIORITY_CHOICES = [
        (LOW, 'Low'),
        (MEDIUM, 'Medium'),
        (HIGH, 'High'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assignee = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_tasks')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=TODO)
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default=MEDIUM)
    due_date = models.DateField(null=True, blank=True)
    estimated_hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title

class TimeReport(models.Model):
    """Model for time reporting on tasks"""
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='time_reports')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='time_reports')
    hours = models.DecimalField(max_digits=5, decimal_places=2)
    date = models.DateField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.task.title} - {self.user.username} - {self.hours} hours"
