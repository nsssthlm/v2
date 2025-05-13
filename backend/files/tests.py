from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from .models import Directory, File
from core.models import User, Project

class FilesModelsTestCase(TestCase):
    """Test cases for files app models"""
    
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username="testuser",
            email="testuser@example.com",
            password="securepassword123"
        )
        
        # Create test project
        self.project = Project.objects.create(
            name="Test Project",
            description="Test project description",
            start_date="2023-01-01"
        )
        
        # Create test directory
        self.root_directory = Directory.objects.create(
            name="Root",
            project=self.project,
            created_by=self.user
        )
        
        self.subdirectory = Directory.objects.create(
            name="Documents",
            project=self.project,
            parent=self.root_directory,
            created_by=self.user
        )
        
        # Create test file
        self.test_file = SimpleUploadedFile(
            "test_file.txt",
            b"This is a test file content",
            content_type="text/plain"
        )
        
        self.file = File.objects.create(
            name="test_file.txt",
            directory=self.subdirectory,
            project=self.project,
            file=self.test_file,
            content_type="text/plain",
            size=len(b"This is a test file content"),
            uploaded_by=self.user
        )
    
    def test_directory_creation(self):
        """Test directory creation and string representation"""
        self.assertEqual(str(self.root_directory), "Root")
        self.assertEqual(str(self.subdirectory), "Documents")
        self.assertEqual(Directory.objects.count(), 2)
    
    def test_directory_path(self):
        """Test directory path generation"""
        self.assertEqual(self.root_directory.get_path(), "Root")
        self.assertEqual(self.subdirectory.get_path(), "Root/Documents")
    
    def test_file_creation(self):
        """Test file creation and string representation"""
        self.assertEqual(str(self.file), "test_file.txt")
        self.assertEqual(File.objects.count(), 1)
    
    def test_file_full_path(self):
        """Test file full path generation"""
        self.assertEqual(self.file.get_full_path(), "Root/Documents/test_file.txt")
    
    def test_file_versioning(self):
        """Test file versioning"""
        # Create a new version of the file
        new_test_file = SimpleUploadedFile(
            "test_file.txt",
            b"This is the updated file content",
            content_type="text/plain"
        )
        
        # Mark original file as not latest
        self.file.is_latest = False
        self.file.save()
        
        # Create new version
        new_file = File.objects.create(
            name="test_file.txt",
            directory=self.subdirectory,
            project=self.project,
            file=new_test_file,
            content_type="text/plain",
            size=len(b"This is the updated file content"),
            version=2,
            previous_version=self.file,
            uploaded_by=self.user
        )
        
        self.assertEqual(new_file.version, 2)
        self.assertEqual(new_file.previous_version, self.file)
        self.assertTrue(new_file.is_latest)
        self.assertFalse(File.objects.get(id=self.file.id).is_latest)

# API Tests will be added when the actual API implementation is completed
