from rest_framework import serializers
from .models import FileNode, FileVersion, FileComment, WikiArticle, ProjectDashboard, PDFDocument
from core.serializers import UserSerializer

class FileNodeSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = FileNode
        fields = [
            'id', 'name', 'type', 'project', 'parent', 'created_by', 
            'created_by_details', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class FileVersionSerializer(serializers.ModelSerializer):
    uploaded_by_details = UserSerializer(source='uploaded_by', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = FileVersion
        fields = [
            'id', 'file_node', 'file', 'file_url', 'version_number', 
            'content_type', 'size', 'uploaded_by', 'uploaded_by_details', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'version_number', 'content_type', 'size', 'uploaded_by']
    
    def get_file_url(self, obj):
        return obj.file.url if obj.file else None
    
    def create(self, validated_data):
        # Set the uploader
        validated_data['uploaded_by'] = self.context['request'].user
        
        # Get or set the version number
        file_node = validated_data.get('file_node')
        latest_version = FileVersion.objects.filter(file_node=file_node).order_by('-version_number').first()
        validated_data['version_number'] = (latest_version.version_number + 1) if latest_version else 1
        
        # Get file size and content type
        file = validated_data.get('file')
        if file:
            validated_data['size'] = file.size
            validated_data['content_type'] = file.content_type
        
        return super().create(validated_data)


class FileCommentSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = FileComment
        fields = ['id', 'file_version', 'user', 'user_details', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class WikiArticleSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    
    class Meta:
        model = WikiArticle
        fields = [
            'id', 'title', 'content', 'project', 'created_by', 
            'created_by_details', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class ProjectDashboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectDashboard
        fields = [
            'id', 'project', 'welcome_message', 'show_recent_files', 
            'show_recent_wiki', 'show_team_activity', 'custom_config'
        ]
        read_only_fields = ['id']


class PDFDocumentSerializer(serializers.ModelSerializer):
    uploaded_by_details = UserSerializer(source='uploaded_by', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = PDFDocument
        fields = [
            'id', 'title', 'description', 'file', 'file_url', 'project', 
            'uploaded_by', 'uploaded_by_details', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'uploaded_by']
    
    def get_file_url(self, obj):
        return obj.file.url if obj.file else None
    
    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)