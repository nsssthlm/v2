from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User, Project, Task, RoleAccess, TimeReport

class CoreModelsTestCase(TestCase):
    """Test cases for core app models"""
    
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
        
        # Assign roles
        self.role_leader = RoleAccess.objects.create(
            user=self.user1,
            project=self.project,
            role=RoleAccess.PROJECT_LEADER
        )
        
        self.role_member = RoleAccess.objects.create(
            user=self.user2,
            project=self.project,
            role=RoleAccess.MEMBER
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
        
        # Create time report
        self.time_report = TimeReport.objects.create(
            task=self.task,
            user=self.user2,
            hours=2.5,
            date="2023-01-15",
            description="Working on test task"
        )
    
    def test_user_creation(self):
        """Test user creation and string representation"""
        self.assertEqual(str(self.user1), "testuser1@example.com")
        self.assertEqual(User.objects.count(), 2)
    
    def test_project_creation(self):
        """Test project creation and string representation"""
        self.assertEqual(str(self.project), "Test Project")
        self.assertEqual(Project.objects.count(), 1)
    
    def test_task_creation(self):
        """Test task creation and string representation"""
        self.assertEqual(str(self.task), "Test Task")
        self.assertEqual(Task.objects.count(), 1)
    
    def test_role_access_creation(self):
        """Test role access creation and string representation"""
        self.assertEqual(str(self.role_leader), "testuser1 - Test Project - project_leader")
        self.assertEqual(RoleAccess.objects.count(), 2)
    
    def test_time_report_creation(self):
        """Test time report creation and string representation"""
        self.assertEqual(str(self.time_report), "Test Task - testuser2 - 2.5 hours")
        self.assertEqual(TimeReport.objects.count(), 1)

# API Tests will be added when the actual API implementation is completed
