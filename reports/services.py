"""
Reporting Services: Aggregation queries for dashboard statistics.
"""

from django.db.models import Count, Q, Avg
from django.db.models.functions import TruncMonth
from django.utils import timezone
from datetime import timedelta

from accounts.models import User
from employers.models import Employer
from candidates.models import Candidate
from jobs.models import Job
from applications.models import JobApplication


def get_platform_statistics():
    """Generate comprehensive platform-wide statistics."""

    now = timezone.now()
    one_year_ago = now - timedelta(days=365)

    stats = {
        # ── User Counts ──
        'total_users': User.objects.count(),
        'total_employers': User.objects.filter(role='employer').count(),
        'total_candidates': User.objects.filter(role='candidate').count(),

        # ── Job Counts ──
        'total_jobs': Job.objects.count(),
        'open_jobs': Job.objects.filter(status='open').count(),
        'closed_jobs': Job.objects.filter(status='closed').count(),

        # ── Application Counts ──
        'total_applications': JobApplication.objects.count(),

        # ── Applications by Status ──
        'applications_by_status': dict(
            JobApplication.objects.values_list('application_status')
            .annotate(count=Count('id'))
            .values_list('application_status', 'count')
        ),

        # ── Top Companies by Hiring (most applications received) ──
        'top_companies_by_hiring': list(
            Job.objects.values('employer__company_name')
            .annotate(app_count=Count('applications'))
            .order_by('-app_count')[:10]
        ),

        # ── Applications per Employer (top 10) ──
        'applications_per_employer': list(
            JobApplication.objects.values('job__employer__company_name')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        ),

        # ── Applications per Job (top 10) ──
        'applications_per_job': list(
            JobApplication.objects.values('job__title', 'job__id')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        ),

        # ── Monthly Job Posting Statistics (last 12 months) ──
        'monthly_job_postings': list(
            Job.objects.filter(created_at__gte=one_year_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        ),

        # ── Monthly Application Statistics (last 12 months) ──
        'monthly_applications': list(
            JobApplication.objects.filter(applied_at__gte=one_year_ago)
            .annotate(month=TruncMonth('applied_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        ),
    }

    # Convert date objects to strings for JSON serialization
    for item in stats.get('monthly_job_postings', []):
        if item.get('month'):
            item['month'] = item['month'].strftime('%Y-%m')

    for item in stats.get('monthly_applications', []):
        if item.get('month'):
            item['month'] = item['month'].strftime('%Y-%m')

    return stats