"""
Serializers for Employer profile CRUD operations.
"""

from rest_framework import serializers
from .models import Employer
from accounts.serializers import UserProfileSerializer


class EmployerSerializer(serializers.ModelSerializer):
    """Full serializer for Employer profile with nested user info."""
    owner_info = UserProfileSerializer(source='owner', read_only=True)

    class Meta:
        model = Employer
        fields = [
            'id', 'owner', 'owner_info', 'company_name', 'company_logo',
            'company_description', 'website', 'industry', 'company_size',
            'location', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def create(self, validated_data):
        """Automatically set the owner to the requesting user."""
        validated_data['owner'] = self.context['request'].user
        return super().create(validated_data)


class EmployerListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for employer list views."""

    class Meta:
        model = Employer
        fields = ['id', 'company_name', 'company_logo', 'industry', 'location', 'company_size']