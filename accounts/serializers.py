"""
Serializers for User Registration, Login, Profile Management, and Password Change.
"""

import re
from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    Validates email uniqueness, password strength, and required fields.
    """
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'password', 'password_confirm',
            'phone', 'role', 'location', 'profile_picture'
        ]
        extra_kwargs = {
            'full_name': {'required': True},
            'role': {'required': True},
        }

    def validate_email(self, value):
        """Validate email format and uniqueness."""
        value = value.lower().strip()
        email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_regex, value):
            raise serializers.ValidationError('Enter a valid email address.')
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def validate_phone(self, value):
        """Validate phone number format."""
        if value:
            phone_regex = r'^\+?1?\d{9,15}$'
            if not re.match(phone_regex, value):
                raise serializers.ValidationError(
                    'Phone must be in format: +999999999 (9-15 digits).'
                )
        return value

    def validate(self, attrs):
        """Cross-field validation: passwords must match."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords do not match.'
            })
        return attrs

    def create(self, validated_data):
        """Create user with hashed password."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login. Returns JWT tokens."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        """Authenticate user credentials."""
        email = attrs.get('email', '').lower().strip()
        password = attrs.get('password')

        user = authenticate(
            request=self.context.get('request'),
            username=email,
            password=password
        )

        if not user:
            raise serializers.ValidationError('Invalid email or password.')

        if not user.is_active:
            raise serializers.ValidationError('Account is deactivated.')

        attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for viewing/updating user profile."""

    class Meta:
        model = User
        fields = [
            'id', 'email', 'full_name', 'phone', 'profile_picture',
            'role', 'location', 'date_joined', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'email', 'role', 'date_joined', 'created_at']


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing user password."""
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password]
    )
    new_password_confirm = serializers.CharField(write_only=True, required=True)

    def validate_old_password(self, value):
        """Verify the old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Old password is incorrect.')
        return value

    def validate(self, attrs):
        """Ensure new passwords match and differ from old."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'New passwords do not match.'
            })
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                'new_password': 'New password must be different from old password.'
            })
        return attrs

    def save(self, **kwargs):
        """Update user password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user