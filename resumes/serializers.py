"""
Serializers for Resume CRUD operations.
"""

from rest_framework import serializers
from .models import Resume


class ResumeSerializer(serializers.ModelSerializer):
    """Full serializer for resumes."""
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    file_size = serializers.SerializerMethodField()

    class Meta:
        model = Resume
        fields = [
            'id', 'candidate', 'candidate_name', 'resume_file',
            'title', 'file_size', 'uploaded_at'
        ]
        read_only_fields = ['id', 'candidate', 'uploaded_at']

    def get_file_size(self, obj):
        if obj.resume_file:
            size_bytes = obj.resume_file.size
            return f"{size_bytes / (1024*1024):.2f} MB"
        return None