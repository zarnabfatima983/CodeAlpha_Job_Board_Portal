"""
Resume model for candidate PDF uploads.
"""

from django.db import models
from django.conf import settings
from .validators import validate_pdf_file


class Resume(models.Model):
    """
    Candidate resume (PDF only, max 5MB).
    """
    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='resumes',
        limit_choices_to={'role': 'candidate'}
    )
    resume_file = models.FileField(
        upload_to='resumes/',
        validators=[validate_pdf_file],
        help_text='Upload your resume (PDF only, max 5MB)'
    )
    title = models.CharField(max_length=255, blank=True, default='My Resume')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'resume'
        verbose_name_plural = 'resumes'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.candidate.full_name} - {self.title}"