"""
Serializers for Job Listings and Categories.
"""

from rest_framework import serializers
from django.utils import timezone
from .models import Job, JobCategory


class JobCategorySerializer(serializers.ModelSerializer):
    """Serializer for job categories."""
    jobs_count = serializers.SerializerMethodField()

    class Meta:
        model = JobCategory
        fields = ['id', 'category_name', 'description', 'jobs_count', 'created_at']

    def get_jobs_count(self, obj):
        return obj.jobs.filter(status='open').count()


class JobSerializer(serializers.ModelSerializer):
    """Full serializer for Job listings."""
    employer_name = serializers.CharField(source='employer.company_name', read_only=True)
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    applications_count = serializers.ReadOnlyField()
    is_open = serializers.ReadOnlyField()

    class Meta:
        model = Job
        fields = [
            'id', 'employer', 'employer_name', 'category', 'category_name',
            'title', 'description', 'requirements', 'responsibilities',
            'salary_min', 'salary_max', 'experience_required', 'employment_type',
            'location', 'remote_option', 'application_deadline', 'status',
            'applications_count', 'is_open', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'employer', 'created_at', 'updated_at']

    def validate(self, attrs):
        """Cross-field salary and deadline validation."""
        salary_min = attrs.get('salary_min', getattr(self.instance, 'salary_min', None))
        salary_max = attrs.get('salary_max', getattr(self.instance, 'salary_max', None))

        if salary_min and salary_max and salary_min > salary_max:
            raise serializers.ValidationError({
                'salary_min': 'Minimum salary cannot exceed maximum salary.'
            })

        deadline = attrs.get('application_deadline',
                             getattr(self.instance, 'application_deadline', None))
        if deadline and deadline <= timezone.now():
            raise serializers.ValidationError({
                'application_deadline': 'Application deadline must be in the future.'
            })

        return attrs

    def create(self, validated_data):
        """Auto-assign employer from request user's employer profile."""
        validated_data['employer'] = self.context['request'].user.employer_profile
        return super().create(validated_data)


class JobListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for job list views."""
    employer_name = serializers.CharField(source='employer.company_name', read_only=True)
    category_name = serializers.CharField(source='category.category_name', read_only=True)
    applications_count = serializers.ReadOnlyField()

    class Meta:
        model = Job
        fields = [
            'id', 'title', 'employer_name', 'category_name',
            'salary_min', 'salary_max', 'employment_type',
            'location', 'remote_option', 'status',
            'application_deadline', 'applications_count', 'created_at'
        ]