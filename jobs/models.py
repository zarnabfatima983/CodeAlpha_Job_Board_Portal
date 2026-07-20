"""
Job Category and Job Listing models.
Normalized database design with proper relationships.
"""

from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone


class JobCategory(models.Model):
    """Category for organizing job listings."""
    category_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'job category'
        verbose_name_plural = 'job categories'
        ordering = ['category_name']

    def __str__(self):
        return self.category_name


class Job(models.Model):
    """
    Job listing posted by an Employer.
    Includes salary range, requirements, and application deadline.
    """

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        CLOSED = 'closed', 'Closed'

    class EmploymentType(models.TextChoices):
        FULL_TIME = 'full_time', 'Full Time'
        PART_TIME = 'part_time', 'Part Time'
        CONTRACT = 'contract', 'Contract'
        FREELANCE = 'freelance', 'Freelance'
        INTERNSHIP = 'internship', 'Internship'

    employer = models.ForeignKey(
        'employers.Employer',
        on_delete=models.CASCADE,
        related_name='jobs'
    )
    category = models.ForeignKey(
        JobCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='jobs'
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    requirements = models.TextField(blank=True, default='')
    responsibilities = models.TextField(blank=True, default='')
    salary_min = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True, blank=True
    )
    salary_max = models.DecimalField(
        max_digits=12, decimal_places=2,
        validators=[MinValueValidator(0)],
        null=True, blank=True
    )
    experience_required = models.CharField(max_length=100, blank=True, default='')
    employment_type = models.CharField(
        max_length=20,
        choices=EmploymentType.choices,
        default=EmploymentType.FULL_TIME
    )
    location = models.CharField(max_length=255, blank=True, default='')
    remote_option = models.BooleanField(default=False)
    application_deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.OPEN
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'job'
        verbose_name_plural = 'jobs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} at {self.employer.company_name}"

    def clean(self):
        """Validate salary range: min must be <= max."""
        from django.core.exceptions import ValidationError
        if self.salary_min and self.salary_max and self.salary_min > self.salary_max:
            raise ValidationError('Minimum salary cannot exceed maximum salary.')

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    @property
    def is_open(self):
        """Check if job is open and deadline hasn't passed."""
        if self.status != self.Status.OPEN:
            return False
        if self.application_deadline and self.application_deadline < timezone.now():
            return False
        return True

    @property
    def applications_count(self):
        return self.applications.count()