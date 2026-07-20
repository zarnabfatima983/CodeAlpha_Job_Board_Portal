"""
Job Views: Full CRUD, Search, Filtering, Pagination.
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from drf_yasg.utils import swagger_auto_schema

from config.permissions import IsEmployer, IsJobOwner
from .models import Job, JobCategory
from .serializers import JobSerializer, JobListSerializer, JobCategorySerializer
from .filters import JobFilter


class JobCreateView(generics.CreateAPIView):
    """
    Create a new job listing (Employers only).
    
    POST /api/jobs/
    """
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    @swagger_auto_schema(operation_summary="Create a Job Listing")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        # Ensure employer profile exists
        if not hasattr(request.user, 'employer_profile'):
            return Response({
                'success': False,
                'message': 'Employer profile not found. Please create one first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete a specific job.
    
    GET    /api/jobs/<id>/
    PUT    /api/jobs/<id>/
    PATCH  /api/jobs/<id>/
    DELETE /api/jobs/<id>/
    """
    queryset = Job.objects.select_related('employer', 'category').all()
    serializer_class = JobSerializer

    def get_permissions(self):
        """Allow anyone to view, but only owner to edit/delete."""
        if self.request.method in ('GET', 'HEAD', 'OPTIONS'):
            return [AllowAny()]
        return [IsAuthenticated(), IsEmployer(), IsJobOwner()]

    @swagger_auto_schema(operation_summary="Get Job Detail")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class JobListView(generics.ListAPIView):
    """
    List all jobs with advanced filtering, searching, and ordering.
    
    GET /api/jobs/list/
    
    Query Parameters:
        - page, page_size: Pagination
        - search: Free text search
        - title, company, category_name: Text filters
        - salary_min_gte, salary_max_lte: Salary range
        - employment_type, remote_option, status, location: Exact/partial filters
        - skill: Keyword search across job content
        - ordering: latest, salary_high, salary_low, deadline
    """
    queryset = Job.objects.select_related('employer', 'category').all()
    serializer_class = JobListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = JobFilter
    search_fields = ['title', 'description', 'employer__company_name', 'requirements']
    ordering_fields = ['created_at', 'salary_min', 'salary_max', 'application_deadline']
    ordering = ['-created_at']  # Default: latest first

    @swagger_auto_schema(operation_summary="List All Jobs with Filters")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class EmployerJobsView(generics.ListAPIView):
    """
    List jobs posted by the authenticated employer.
    
    GET /api/jobs/my-jobs/
    """
    serializer_class = JobListSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        return Job.objects.filter(
            employer__owner=self.request.user
        ).select_related('employer', 'category')


class OpenJobsView(generics.ListAPIView):
    """List all open jobs."""
    serializer_class = JobListSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = JobFilter

    def get_queryset(self):
        return Job.objects.filter(status='open').select_related('employer', 'category')


class ClosedJobsView(generics.ListAPIView):
    """List all closed jobs."""
    serializer_class = JobListSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        return Job.objects.filter(status='closed').select_related('employer', 'category')


# ──────────────────────────────────────────────
# Category Views
# ──────────────────────────────────────────────

class JobCategoryListView(generics.ListAPIView):
    """List all job categories."""
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [AllowAny]


class JobCategoryCreateView(generics.CreateAPIView):
    """Create a job category (admin/employer)."""
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [IsAuthenticated, IsEmployer]