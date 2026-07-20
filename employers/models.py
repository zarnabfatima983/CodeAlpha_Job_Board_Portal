"""
Employer model linked to User with company details.
"""

from django.db import models
from django.conf import settings


class Employer(models.Model):
    """
    Extended profile for Employer users containing company information.
    """

    class CompanySize(models.TextChoices):
        MICRO = '1-10', '1-10 employees'
        SMALL = '11-50', '11-50 employees'
        MEDIUM = '51-200', '51-200 employees'
        LARGE = '201-1000', '201-1000 employees'
        ENTERPRISE = '1000+', '1000+ employees'

    owner = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='employer_profile',
        limit_choices_to={'role': 'employer'}
    )
    company_name = models.CharField(max_length=255)
    company_logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    company_description = models.TextField(blank=True, default='')
    website = models.URLField(blank=True, default='')
    industry = models.CharField(max_length=100, blank=True, default='')
    company_size = models.CharField(
        max_length=20,
        choices=CompanySize.choices,
        blank=True,
        default=''
    )
    location = models.CharField(max_length=255, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'employer'
        verbose_name_plural = 'employers'
        ordering = ['company_name']

    def __str__(self):
        return f"{self.company_name} ({self.owner.email})"