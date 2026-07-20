"""
Job Application Views: Apply, Withdraw, Update Status, View Applications.
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.utils import timezone
from django.db.models import Q
from drf_yasg.utils import swagger_auto_schema

from config.permissions import IsEmployer, IsCandidate
from .models import JobApplication
from .serializers import (
    JobApplicationSerializer,
    ApplicationStatusUpdateSerializer,
    ApplicationListSerializer,
)
from jobs.models import Job
from notifications.models import Notification


class ApplyForJobView(generics.CreateAPIView):
    """
    Apply for a job (Candidates only).
    
    POST /api/applications/apply/
    
    Business Rules:
        - Only candidates can apply
        - Cannot apply to closed jobs
        - Cannot apply after deadline
        - Cannot apply twice to the same job
    """
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    @swagger_auto_schema(operation_summary="Apply for a Job")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        job_id = request.data.get('job')

        if not job_id:
            return Response({
                'success': False,
                'message': 'Job ID is required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Job not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Business rule: job must be open
        if job.status != 'open':
            return Response({
                'success': False,
                'message': 'This job is no longer accepting applications.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Business rule: deadline check
        if job.application_deadline and job.application_deadline < timezone.now():
            return Response({
                'success': False,
                'message': 'Application deadline has passed.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Business rule: prevent duplicate applications
        if JobApplication.objects.filter(candidate=request.user, job=job).exists():
            return Response({
                'success': False,
                'message': 'You have already applied for this job.'
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save(candidate=request.user)

        # Create notification for employer
        Notification.objects.create(
            employer=job.employer.owner,
            candidate=request.user,
            title='New Job Application',
            message=f'{request.user.full_name} applied for "{job.title}".',
        )

        return Response({
            'success': True,
            'message': 'Application submitted successfully.',
            'data': JobApplicationSerializer(application).data
        }, status=status.HTTP_201_CREATED)


class WithdrawApplicationView(APIView):
    """
    Withdraw a job application (Candidates only).
    
    DELETE /api/applications/<id>/withdraw/
    """
    permission_classes = [IsAuthenticated, IsCandidate]

    @swagger_auto_schema(operation_summary="Withdraw Application")
    def delete(self, request, pk):
        try:
            application = JobApplication.objects.get(
                id=pk,
                candidate=request.user
            )
        except JobApplication.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Application not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        # Only allow withdrawal if status is 'applied' or 'under_review'
        if application.application_status not in ('applied', 'under_review'):
            return Response({
                'success': False,
                'message': 'Cannot withdraw application at current status.'
            }, status=status.HTTP_400_BAD_REQUEST)

        application.delete()
        return Response({
            'success': True,
            'message': 'Application withdrawn successfully.'
        }, status=status.HTTP_200_OK)


class UpdateApplicationStatusView(generics.UpdateAPIView):
    """
    Update application status (Employers only).
    
    PATCH /api/applications/<id>/status/
    """
    serializer_class = ApplicationStatusUpdateSerializer
    permission_classes = [IsAuthenticated, IsEmployer]
    lookup_field = 'pk'

    def get_queryset(self):
        return JobApplication.objects.filter(job__employer__owner=self.request.user)

    def perform_update(self, serializer):
        application = serializer.save()
        # Notify candidate of status change
        Notification.objects.create(
            employer=self.request.user,
            candidate=application.candidate,
            title='Application Status Update',
            message=f'Your application for "{application.job.title}" has been updated to "{application.application_status}".',
        )


class CandidateApplicationsView(generics.ListAPIView):
    """
    List all applications by the authenticated candidate.
    
    GET /api/applications/my-applications/
    """
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        return JobApplication.objects.filter(
            candidate=self.request.user
        ).select_related('job', 'job__employer', 'resume')


class EmployerApplicationsView(generics.ListAPIView):
    """
    List all applications for the authenticated employer's jobs.
    
    GET /api/applications/employer-applications/
    
    Optional filters:
        - job_id: Filter by specific job
        - status: Filter by application status
    """
    serializer_class = ApplicationListSerializer
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_queryset(self):
        qs = JobApplication.objects.filter(
            job__employer__owner=self.request.user
        ).select_related('candidate', 'job')

        # Optional filtering
        job_id = self.request.query_params.get('job_id')
        app_status = self.request.query_params.get('status')

        if job_id:
            qs = qs.filter(job_id=job_id)
        if app_status:
            qs = qs.filter(application_status=app_status)

        return qs