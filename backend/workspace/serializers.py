from rest_framework import serializers
from .models import FileNode, FileVersion, FileComment, WikiArticle, ProjectDashboard, PDFDocument
from core.serializers import UserSerializer

class FileNodeSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = FileNode
        fields = [
            'id', 'name', 'type', 'project', 'parent', 
            'created_by', 'created_by_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by_details']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class FileVersionSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    uploaded_by_details = UserSerializer(source='uploaded_by', read_only=True)
    
    class Meta:
        model = FileVersion
        fields = [
            'id', 'file_node', 'version', 'file', 'file_url',
            'content_type', 'size', 'uploaded_by', 'uploaded_by_details',
            'created_at'
        ]
        read_only_fields = ['id', 'version', 'file_url', 'content_type', 'size', 'created_at', 'uploaded_by_details']
    
    def get_file_url(self, obj):
        if obj.file and hasattr(obj.file, 'url'):
            request = self.context.get('request')
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        
        # Extract file metadata
        file = validated_data.get('file')
        if file:
            validated_data['size'] = file.size
            validated_data['content_type'] = file.content_type
            
        return super().create(validated_data)

class FileCommentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = FileComment
        fields = [
            'id', 'file_version', 'user', 'user_details',
            'content', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'user_details', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class WikiArticleSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = WikiArticle
        fields = [
            'id', 'title', 'content', 'project',
            'created_by', 'created_by_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_by_details', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class ProjectDashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectDashboard
        fields = [
            'id', 'project', 'welcome_message',
            'show_recent_files', 'show_recent_wiki', 'show_team_activity',
            'custom_config', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

class PDFDocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    uploaded_by_details = UserSerializer(source='uploaded_by', read_only=True)
    
    class Meta:
        model = PDFDocument
        fields = [
            'id', 'title', 'description', 'file', 'file_url',
            'project', 'uploaded_by', 'uploaded_by_details',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'file_url', 'uploaded_by', 'uploaded_by_details', 'created_at', 'updated_at']
    
    def get_file_url(self, obj):
        if obj.file and hasattr(obj.file, 'url'):
            request = self.context.get('request')
            return request.build_absolute_uri(obj.file.url) if request else obj.file.url
        return None
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)