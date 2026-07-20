"""
Serializers for Job Applications.
"""

from rest_framework import serializers
from .models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):
    """Full serializer for job applications."""
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)
    employer_name = serializers.CharField(source='job.employer.company_name', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'candidate', 'candidate_name', 'job', 'job_title',
            'employer_name', 'resume', 'cover_letter',
            'application_status', 'applied_at', 'updated_at'
        ]
        read_only_fields = ['id', 'candidate', 'application_status', 'applied_at', 'updated_at']


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating application status (employer use)."""

    class Meta:
        model = JobApplication
        fields = ['application_status']


class ApplicationListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for application list views."""
    candidate_name = serializers.CharField(source='candidate.full_name', read_only=True)
    candidate_email = serializers.CharField(source='candidate.email', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'id', 'candidate_name', 'candidate_email', 'job_title',
            'application_status', 'applied_at'
        ]