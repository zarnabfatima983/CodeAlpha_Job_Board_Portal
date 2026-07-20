"""
Resume Views: Upload, Replace, Delete, Download, View.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.http import FileResponse, Http404
from drf_yasg.utils import swagger_auto_schema

from config.permissions import IsCandidate
from .models import Resume
from .serializers import ResumeSerializer


class ResumeUploadView(generics.CreateAPIView):
    """
    Upload a new resume (Candidates only, PDF only, max 5MB).
    
    POST /api/resumes/
    """
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    @swagger_auto_schema(operation_summary="Upload Resume")
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(candidate=self.request.user)


class ResumeListView(generics.ListAPIView):
    """
    List all resumes of the authenticated candidate.
    
    GET /api/resumes/
    """
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        return Resume.objects.filter(candidate=self.request.user)


class ResumeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    View, update (replace), or delete a specific resume.
    
    GET    /api/resumes/<id>/
    PUT    /api/resumes/<id>/  (replace file)
    DELETE /api/resumes/<id>/
    """
    serializer_class = ResumeSerializer
    permission_classes = [IsAuthenticated, IsCandidate]

    def get_queryset(self):
        return Resume.objects.filter(candidate=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Delete the actual file from storage
        if instance.resume_file:
            instance.resume_file.delete(save=False)
        instance.delete()
        return Response({
            'success': True,
            'message': 'Resume deleted successfully.'
        }, status=status.HTTP_200_OK)


class ResumeDownloadView(APIView):
    """
    Download a resume file.
    
    GET /api/resumes/<id>/download/
    """
    permission_classes = [IsAuthenticated, IsCandidate]

    @swagger_auto_schema(operation_summary="Download Resume File")
    def get(self, request, pk):
        try:
            resume = Resume.objects.get(id=pk, candidate=request.user)
        except Resume.DoesNotExist:
            raise Http404("Resume not found.")

        if not resume.resume_file:
            return Response({
                'success': False,
                'message': 'No file found for this resume.'
            }, status=status.HTTP_404_NOT_FOUND)

        response = FileResponse(
            resume.resume_file.open('rb'),
            content_type='application/pdf'
        )
        response['Content-Disposition'] = f'attachment; filename="{resume.resume_file.name.split("/")[-1]}"'
        return response