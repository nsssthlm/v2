from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError
from core.models import Project, Task

class Notification(models.Model):
    """Model for user notifications"""
    TASK_ASSIGNED = 'task_assigned'
    TASK_COMPLETED = 'task_completed'
    COMMENT_ADDED = 'comment_added'
    FILE_UPLOADED = 'file_uploaded'
    MEETING_SCHEDULED = 'meeting_scheduled'
    DUE_DATE_REMINDER = 'due_date_reminder'
    CUSTOM = 'custom'
    
    TYPE_CHOICES = [
        (TASK_ASSIGNED, 'Task Assigned'),
        (TASK_COMPLETED, 'Task Completed'),
        (COMMENT_ADDED, 'Comment Added'),
        (FILE_UPLOADED, 'File Uploaded'),
        (MEETING_SCHEDULED, 'Meeting Scheduled'),
        (DUE_DATE_REMINDER, 'Due Date Reminder'),
        (CUSTOM, 'Custom'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='notifications', null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    class Meta:
        ordering = ['-created_at']

class Meeting(models.Model):
    """Model for project meetings"""
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='meetings')
    organizer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='organized_meetings')
    attendees = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='meetings')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    location = models.CharField(max_length=255, blank=True)  # Physical location or virtual link
    is_virtual = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    def clean(self):
        """Ensure end_time is after start_time"""
        if self.end_time <= self.start_time:
            raise ValidationError({"end_time": "End time must be after start time"})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-start_time']
