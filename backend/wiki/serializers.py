from rest_framework import serializers
from .models import WikiArticle

class WikiArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = WikiArticle
        fields = [
            'id', 'title', 'content', 'project', 'created_by',
            'last_edited_by', 'created_at', 'updated_at', 'parent', 'order'
        ]
        read_only_fields = ['id', 'created_by', 'last_edited_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        validated_data['last_edited_by'] = user
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        validated_data['last_edited_by'] = self.context['request'].user
        return super().update(instance, validated_data)
