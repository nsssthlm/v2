from rest_framework import serializers
from .models import Notification, Meeting

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'title', 'message', 'type', 'project',
            'task', 'is_read', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def create(self, validated_data):
        return super().create(validated_data)

class MeetingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meeting
        fields = [
            'id', 'title', 'description', 'project', 'organizer', 'attendees',
            'start_time', 'end_time', 'location', 'is_virtual', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'organizer']
    
    def create(self, validated_data):
        validated_data['organizer'] = self.context['request'].user
        return super().create(validated_data)
    
    def validate(self, attrs):
        # Ensure end_time is after start_time
        if attrs.get('start_time') and attrs.get('end_time'):
            if attrs['end_time'] <= attrs['start_time']:
                raise serializers.ValidationError({
                    "end_time": "End time must be after start time."
                })
        return attrs
