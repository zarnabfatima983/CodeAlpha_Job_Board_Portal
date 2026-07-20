"""
Candidate model linked to User with professional details.
"""

from django.db import models
from django.conf import settings


class Candidate(models.Model):
    """
    Extended profile for Candidate users with skills and experience.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='candidate_profile',
        limit_choices_to={'role': 'candidate'}
    )
    title = models.CharField(max_length=255, blank=True, default='',
                             help_text='e.g., Senior Software Engineer')
    experience = models.TextField(blank=True, default='',
                                  help_text='Years or description of experience')
    education = models.TextField(blank=True, default='',
                                 help_text='Education background')
    skills = models.TextField(blank=True, default='',
                              help_text='Comma-separated list of skills')
    portfolio_link = models.URLField(blank=True, default='')
    linkedin = models.URLField(blank=True, default='')
    github = models.URLField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'candidate'
        verbose_name_plural = 'candidates'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.full_name} - {self.title or 'Candidate'}"

    @property
    def skills_list(self):
        """Return skills as a list."""
        if self.skills:
            return [s.strip() for s in self.skills.split(',') if s.strip()]
        return []