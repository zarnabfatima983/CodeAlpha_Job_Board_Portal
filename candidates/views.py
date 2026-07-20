"""
Candidate Views: Create, Update, Dashboard, Profile.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from config.permissions import IsCandidate
from .models import Candidate
from .serializers import CandidateSerializer
from drf_yasg.utils import swagger_auto_schema


class CandidateCreateView(generics.CreateAPIView):
    """
    Create a Candidate profile.
    
    POST /api/candidates/
    """
    serializer_class = CandidateSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    @swagger_auto_schema(operation_summary="Create Candidate Profile")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        if Candidate.objects.filter(user=request.user).exists():
            return Response({
                'success': False,
                'message': 'Candidate profile already exists.'
            }, status=status.HTTP_400_BAD_REQUEST)
        return super().create(request, *args, **kwargs)


class CandidateUpdateView(generics.RetrieveUpdateAPIView):
    """
    Update the authenticated candidate's profile.
    
    GET/PUT/PATCH /api/candidates/profile/
    """
    serializer_class = CandidateSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_object(self):
        obj, _ = Candidate.objects.get_or_create(user=self.request.user)
        return obj


class CandidateDashboardView(APIView):
    """
    Candidate dashboard with application statistics.
    
    GET /api/candidates/dashboard/
    """
    permission_classes = [IsAuthenticated, IsCandidate]

    @swagger_auto_schema(operation_summary="Candidate Dashboard")
    def get(self, request):
        from applications.models import JobApplication
        from resumes.models import Resume

        applications = JobApplication.objects.filter(candidate=request.user)

        data = {
            'total_applications': applications.count(),
            'applications_by_status': {
                'applied': applications.filter(application_status='applied').count(),
                'under_review': applications.filter(application_status='under_review').count(),
                'shortlisted': applications.filter(application_status='shortlisted').count(),
                'interview': applications.filter(application_status='interview').count(),
                'selected': applications.filter(application_status='selected').count(),
                'rejected': applications.filter(application_status='rejected').count(),
            },
            'total_resumes': Resume.objects.filter(candidate=request.user).count(),
        }

        return Response({'success': True, 'data': data})