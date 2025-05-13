from django.test import TestCase
from django.utils import timezone
from datetime import timedelta
from .models import Notification, Meeting
from core.models import User, Project, Task

class NotificationsModelsTestCase(TestCase):
    """Test cases for notifications app models"""
    
    def setUp(self):
        # Create test users
        self.user1 = User.objects.create_user(
            username="testuser1",
            email="testuser1@example.com",
            password="securepassword123"
        )
        
        self.user2 = User.objects.create_user(
            username="testuser2",
            email="testuser2@example.com",
            password="securepassword123"
        )
        
        # Create test project
        self.project = Project.objects.create(
            name="Test Project",
            description="Test project description",
            start_date="2023-01-01"
        )
        
        # Create test task
        self.task = Task.objects.create(
            title="Test Task",
            description="Test task description",
            project=self.project,
            assignee=self.user2,
            created_by=self.user1,
            status=Task.TODO,
            priority=Task.MEDIUM
        )
        
        # Create test notification
        self.notification = Notification.objects.create(
            user=self.user2,
            title="Task Assigned",
            message="You have been assigned to 'Test Task'",
            type=Notification.TASK_ASSIGNED,
            project=self.project,
            task=self.task
        )
        
        # Create test meeting
        now = timezone.now()
        self.meeting = Meeting.objects.create(
            title="Project Kickoff",
            description="Initial project kickoff meeting",
            project=self.project,
            organizer=self.user1,
            start_time=now + timedelta(days=1),
            end_time=now + timedelta(days=1, hours=1),
            location="Conference Room A",
            is_virtual=False
        )
        
        # Add attendees to meeting
        self.meeting.attendees.add(self.user1, self.user2)
    
    def test_notification_creation(self):
        """Test notification creation and string representation"""
        self.assertEqual(str(self.notification), "Task Assigned - testuser2")
        self.assertEqual(Notification.objects.count(), 1)
    
    def test_notification_defaults(self):
        """Test notification default values"""
        self.assertFalse(self.notification.is_read)
    
    def test_meeting_creation(self):
        """Test meeting creation and string representation"""
        self.assertEqual(str(self.meeting), "Project Kickoff")
        self.assertEqual(Meeting.objects.count(), 1)
    
    def test_meeting_attendees(self):
        """Test meeting attendees"""
        self.assertEqual(self.meeting.attendees.count(), 2)
        self.assertIn(self.user1, self.meeting.attendees.all())
        self.assertIn(self.user2, self.meeting.attendees.all())
    
    def test_meeting_time_validation(self):
        """Test meeting time validation (end_time must be after start_time)"""
        now = timezone.now()
        
        # Try to create meeting with end_time before start_time
        with self.assertRaises(Exception):
            invalid_meeting = Meeting.objects.create(
                title="Invalid Meeting",
                description="Meeting with invalid time range",
                project=self.project,
                organizer=self.user1,
                start_time=now + timedelta(days=1),
                end_time=now,  # End time before start time
                location="Virtual",
                is_virtual=True
            )

# API Tests will be added when the actual API implementation is completed
