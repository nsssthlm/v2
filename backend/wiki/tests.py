from django.test import TestCase
from .models import WikiArticle
from core.models import User, Project

class WikiModelsTestCase(TestCase):
    """Test cases for wiki app models"""
    
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
        
        # Create root wiki article
        self.root_article = WikiArticle.objects.create(
            title="Project Overview",
            content="This is the main project overview page.",
            project=self.project,
            created_by=self.user1,
            last_edited_by=self.user1,
            order=1
        )
        
        # Create child wiki article
        self.child_article = WikiArticle.objects.create(
            title="Getting Started",
            content="Instructions for getting started with the project.",
            project=self.project,
            created_by=self.user1,
            last_edited_by=self.user1,
            parent=self.root_article,
            order=1
        )
        
        # Create another child wiki article
        self.another_child_article = WikiArticle.objects.create(
            title="Technical Documentation",
            content="Technical documentation for developers.",
            project=self.project,
            created_by=self.user2,
            last_edited_by=self.user2,
            parent=self.root_article,
            order=2
        )
    
    def test_wiki_article_creation(self):
        """Test wiki article creation and string representation"""
        self.assertEqual(str(self.root_article), "Project Overview")
        self.assertEqual(str(self.child_article), "Getting Started")
        self.assertEqual(WikiArticle.objects.count(), 3)
    
    def test_wiki_article_hierarchy(self):
        """Test wiki article hierarchy"""
        self.assertIsNone(self.root_article.parent)
        self.assertEqual(self.child_article.parent, self.root_article)
        self.assertEqual(self.another_child_article.parent, self.root_article)
        
        # Test children relationship
        children = self.root_article.children.all()
        self.assertEqual(children.count(), 2)
        self.assertIn(self.child_article, children)
        self.assertIn(self.another_child_article, children)
    
    def test_wiki_ordering(self):
        """Test wiki article ordering"""
        # Get children in order
        children = self.root_article.children.all().order_by('order', 'title')
        
        # First should be "Getting Started" (order 1)
        # Second should be "Technical Documentation" (order 2)
        self.assertEqual(list(children), [self.child_article, self.another_child_article])

# API Tests will be added when the actual API implementation is completed
