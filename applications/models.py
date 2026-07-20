"""
Job Application model tracking candidates' applications to jobs.
"""

from django.db import models
from django.conf import settings


class JobApplication(models.Model):
    """
    Tracks a candidate's application to a specific job.
    Enforces unique constraint: one application per candidate per job.
    """

    class ApplicationStatus(models.TextChoices):
        APPLIED = 'applied', 'Applied'
        UNDER_REVIEW = 'under_review', 'Under Review'
        SHORTLISTED = 'shortlisted', 'Shortlisted'
        INTERVIEW = 'interview', 'Interview'
        SELECTED = 'selected', 'Selected'
        REJECTED = 'rejected', 'Rejected'

    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='applications',
        limit_choices_to={'role': 'candidate'}
    )
    job = models.ForeignKey(
        'jobs.Job',
        on_delete=models.CASCADE,
        related_name='applications'
    )
    resume = models.ForeignKey(
        'resumes.Resume',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='applications'
    )
    cover_letter = models.TextField(blank=True, default='')
    application_status = models.CharField(
        max_length=20,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.APPLIED
    )
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'job application'
        verbose_name_plural = 'job applications'
        ordering = ['-applied_at']
        # Prevent duplicate applications: one per candidate per job
        constraints = [
            models.UniqueConstraint(
                fields=['candidate', 'job'],
                name='unique_candidate_job_application'
            )
        ]

    def __str__(self):
        return f"{self.candidate.full_name} -> {self.job.title} ({self.application_status})"