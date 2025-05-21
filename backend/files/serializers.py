from rest_framework import serializers
from .models import Directory, File, PDFAnnotation
from django.contrib.auth import get_user_model
from core.serializers import ProjectSerializer

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class DirectorySerializer(serializers.ModelSerializer):
    """Serializer för Directory-modellen"""
    class Meta:
        model = Directory
        fields = '__all__'

class FileSerializer(serializers.ModelSerializer):
    """Serializer för File-modellen"""
    directory_name = serializers.CharField(source='directory.name', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.username', read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = File
        fields = [
            'id', 'name', 'directory', 'directory_name', 'project', 'project_name', 
            'file', 'content_type', 'size', 'version', 'previous_version', 
            'is_latest', 'description', 'uploaded_by', 'uploaded_by_name', 
            'created_at', 'updated_at', 'file_url'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None

class PDFAnnotationSerializer(serializers.ModelSerializer):
    created_by_details = UserSerializer(source='created_by', read_only=True)
    assigned_to_details = UserSerializer(source='assigned_to', read_only=True)
    file_details = FileSerializer(source='file', read_only=True)
    project_details = ProjectSerializer(source='project', read_only=True)
    
    class Meta:
        model = PDFAnnotation
        fields = [
            'id', 'file', 'file_details', 'project', 'project_details', 
            'x', 'y', 'width', 'height', 'page_number',
            'comment', 'color', 'status', 'created_by', 'created_by_details',
            'created_at', 'updated_at', 'assigned_to', 'assigned_to_details', 'deadline'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        # Sätt användaren som skapade annotationen
        user = self.context['request'].user
        validated_data['created_by'] = user
        return super().create(validated_data)