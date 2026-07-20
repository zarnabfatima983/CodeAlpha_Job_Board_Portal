"""
Reporting Views: Platform statistics and analytics dashboards.
"""

from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from drf_yasg.utils import swagger_auto_schema

from .services import get_platform_statistics


class PlatformReportView(APIView):
    """
    Comprehensive platform statistics dashboard.
    
    GET /api/reports/platform/
    
    Returns:
        - Total Users, Employers, Candidates
        - Total Jobs (Open / Closed)
        - Total Applications
        - Applications by Status
        - Top Companies by Hiring
        - Applications per Employer
        - Applications per Job
        - Monthly Job Posting Statistics
        - Monthly Applications Statistics
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    @swagger_auto_schema(
        operation_summary="Platform Statistics Report",
        operation_description="Returns comprehensive platform analytics. Admin access required.",
        responses={200: "Report data"}
    )
    def get(self, request):
        stats = get_platform_statistics()
        return Response({
            'success': True,
            'data': stats
        })