"""
Advanced filtering, searching, and ordering for Job listings.
"""

import django_filters
from .models import Job


class JobFilter(django_filters.FilterSet):
    """
    Comprehensive filter set for jobs.
    
    Supports:
        - Text search on title, description, employer name
        - Category filtering
        - Salary range filtering
        - Employment type
        - Remote option
        - Status
        - Location
        - Experience level
    """
    # Text search
    title = django_filters.CharFilter(field_name='title', lookup_expr='icontains')
    description = django_filters.CharFilter(field_name='description', lookup_expr='icontains')
    company = django_filters.CharFilter(field_name='employer__company_name', lookup_expr='icontains')

    # Category
    category = django_filters.NumberFilter(field_name='category__id')
    category_name = django_filters.CharFilter(field_name='category__category_name', lookup_expr='iexact')

    # Salary range
    salary_min_gte = django_filters.NumberFilter(field_name='salary_min', lookup_expr='gte')
    salary_max_lte = django_filters.NumberFilter(field_name='salary_max', lookup_expr='lte')

    # Other fields
    employment_type = django_filters.ChoiceFilter(choices=Job.EmploymentType.choices)
    remote_option = django_filters.BooleanFilter()
    status = django_filters.ChoiceFilter(choices=Job.Status.choices)
    location = django_filters.CharFilter(field_name='location', lookup_expr='icontains')
    experience = django_filters.CharFilter(field_name='experience_required', lookup_expr='icontains')

    # Skill-based search (searches in description and requirements)
    skill = django_filters.CharFilter(method='filter_by_skill')

    class Meta:
        model = Job
        fields = [
            'title', 'description', 'company', 'category', 'category_name',
            'salary_min_gte', 'salary_max_lte', 'employment_type',
            'remote_option', 'status', 'location', 'experience', 'skill'
        ]

    def filter_by_skill(self, queryset, name, value):
        """Search for a skill keyword in description, requirements, and title."""
        from django.db.models import Q
        return queryset.filter(
            Q(description__icontains=value) |
            Q(requirements__icontains=value) |
            Q(title__icontains=value) |
            Q(responsibilities__icontains=value)
        )