"""
Custom User model with role-based access (Employer / Candidate).
Extends Django's AbstractBaseUser for full control.
"""

from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.core.validators import RegexValidator


class UserManager(BaseUserManager):
    """Custom user manager: email as the unique identifier instead of username."""

    def create_user(self, email, password=None, **extra_fields):
        """Create and return a regular user with the given email and password."""
        if not email:
            raise ValueError('Users must have an email address.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        """Create and return a superuser."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'employer')  # Default for admin

        if not extra_fields.get('is_staff'):
            raise ValueError('Superuser must have is_staff=True.')
        if not extra_fields.get('is_superuser'):
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model with role-based access control.
    
    Roles:
        - employer: Can post and manage jobs
        - candidate: Can upload resumes and apply for jobs
    """

    class Role(models.TextChoices):
        EMPLOYER = 'employer', 'Employer'
        CANDIDATE = 'candidate', 'Candidate'

    # Phone number validator (international format)
    phone_validator = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message='Phone number must be entered in the format: "+999999999". Up to 15 digits allowed.'
    )

    email = models.EmailField(
        'email address',
        unique=True,
        error_messages={'unique': 'A user with this email already exists.'}
    )
    full_name = models.CharField('full name', max_length=255)
    phone = models.CharField(
        'phone number',
        max_length=17,
        blank=True,
        validators=[phone_validator]
    )
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True
    )
    role = models.CharField(
        'role',
        max_length=20,
        choices=Role.choices,
        default=Role.CANDIDATE
    )
    location = models.CharField(max_length=255, blank=True, default='')

    # Django permission fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        verbose_name = 'user'
        verbose_name_plural = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.email})"

    @property
    def is_employer(self):
        return self.role == self.Role.EMPLOYER

    @property
    def is_candidate(self):
        return self.role == self.Role.CANDIDATE