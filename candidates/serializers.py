"""
Serializers for Candidate profile CRUD operations.
"""

from rest_framework import serializers
from .models import Candidate
from accounts.serializers import UserProfileSerializer


class CandidateSerializer(serializers.ModelSerializer):
    """Full serializer for Candidate profile."""
    user_info = UserProfileSerializer(source='user', read_only=True)
    skills_list = serializers.ReadOnlyField()

    class Meta:
        model = Candidate
        fields = [
            'id', 'user', 'user_info', 'title', 'experience', 'education',
            'skills', 'skills_list', 'portfolio_link', 'linkedin', 'github',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CandidateListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for candidate list views."""
    full_name = serializers.CharField(source='user.full_name', read_only=True)

    class Meta:
        model = Candidate
        fields = ['id', 'full_name', 'title', 'skills', 'location']