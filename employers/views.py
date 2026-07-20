"""
Employer Views: Create, Update, Dashboard, Profile.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from config.permissions import IsEmployer
from .models import Employer
from .serializers import EmployerSerializer, EmployerListSerializer
from drf_yasg.utils import swagger_auto_schema


class EmployerCreateView(generics.CreateAPIView):
    """
    Create an Employer profile (only for Employer role users).
    
    POST /api/employers/
    """
    serializer_class = EmployerSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    @swagger_auto_schema(operation_summary="Create Employer Profile")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        # Prevent duplicate employer profiles
        if Employer.objects.filter(owner=request.user).exists():
            return Response({
                'success': False,
                'message': 'Employer profile already exists. Use update instead.'
            }, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)


class EmployerUpdateView(generics.RetrieveUpdateAPIView):
    """
    Update the authenticated employer's profile.
    
    GET/PUT/PATCH /api/employers/profile/
    """
    serializer_class = EmployerSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_object(self):
        obj, _ = Employer.objects.get_or_create(owner=self.request.user)
        return obj


class EmployerDashboardView(APIView):
    """
    Employer dashboard with statistics about jobs and applications.
    
    GET /api/employers/dashboard/
    """
    permission_classes = [IsAuthenticated, IsEmployer]

    @swagger_auto_schema(operation_summary="Employer Dashboard")
    def get(self, request):
        from jobs.models import Job
        from applications.models import JobApplication

        employer = getattr(request.user, 'employer_profile', None)
        if not employer:
            return Response({
                'success': False,
                'message': 'Employer profile not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        jobs = Job.objects.filter(employer=employer)
        applications = JobApplication.objects.filter(job__employer=employer)

        data = {
            'total_jobs': jobs.count(),
            'open_jobs': jobs.filter(status='open').count(),
            'closed_jobs': jobs.filter(status='closed').count(),
            'total_applications': applications.count(),
            'applications_by_status': {
                'applied': applications.filter(application_status='applied').count(),
                'under_review': applications.filter(application_status='under_review').count(),
                'shortlisted': applications.filter(application_status='shortlisted').count(),
                'interview': applications.filter(application_status='interview').count(),
                'selected': applications.filter(application_status='selected').count(),
                'rejected': applications.filter(application_status='rejected').count(),
            }
        }

        return Response({
            'success': True,
            'data': data
        })