from rest_framework import serializers
from core.models import User
from core.serializers import UserSerializer
from .models import FileNode, FileVersion, FileComment, WikiArticle, ProjectDashboard, PDFDocument

class FileNodeSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = FileNode
        fields = ['id', 'name', 'type', 'parent', 'project', 'created_by', 'created_by_details', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class FileVersionSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = FileVersion
        fields = ['id', 'file_node', 'file', 'version', 'content_type', 'size', 'created_by', 'created_by_details', 'created_at']
        read_only_fields = ['id', 'version', 'content_type', 'size', 'created_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        
        # Get file size and content type
        file = validated_data.get('file')
        if file:
            validated_data['size'] = file.size
            validated_data['content_type'] = file.content_type
        
        return super().create(validated_data)

class FileCommentSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = FileComment
        fields = ['id', 'file_node', 'content', 'created_by', 'created_by_details', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class WikiArticleSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = WikiArticle
        fields = [
            'id', 'title', 'content', 'project', 'parent', 
            'created_by', 'created_by_details', 'created_at', 'updated_at',
            'is_published', 'is_index', 'is_archived'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ProjectDashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectDashboard
        fields = ['id', 'project', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class PDFDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_details = UserSerializer(source='uploaded_by', read_only=True)
    
    class Meta:
        model = PDFDocument
        fields = [
            'id', 'unique_id', 'title', 'description', 'file', 'file_url', 'content_type', 
            'size', 'version', 'project', 'uploaded_by', 'uploaded_by_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'unique_id', 'file_url', 'uploaded_by', 'content_type', 'size', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        
        # Get file size and content type
        file = validated_data.get('file')
        if file:
            validated_data['size'] = file.size
            validated_data['content_type'] = file.content_type
        
        return super().create(validated_data)