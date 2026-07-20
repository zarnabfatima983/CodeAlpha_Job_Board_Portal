"""
Authentication and User Profile Views.
Handles Registration, Login, Logout, Token Refresh, Profile CRUD, and Password Change.
"""

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth import logout
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import User
from .serializers import (
    UserRegistrationSerializer,
    LoginSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
)


class RegisterView(generics.CreateAPIView):
    """
    Register a new user (Employer or Candidate).
    
    POST /api/auth/register/
    """
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_summary="Register a new user",
        operation_description="Create a new Employer or Candidate account.",
        responses={201: "User created successfully", 400: "Validation Error"}
    )
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generate JWT tokens for the new user
        refresh = RefreshToken.for_user(user)

        return Response({
            'success': True,
            'message': 'User registered successfully.',
            'data': {
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """
    Authenticate user and return JWT tokens.
    
    POST /api/auth/login/
    """
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_summary="User Login",
        request_body=LoginSerializer,
        responses={200: "Login successful", 401: "Invalid credentials"}
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        return Response({
            'success': True,
            'message': 'Login successful.',
            'data': {
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }
        }, status=status.HTTP_200_OK)


class LogoutView(APIView):
    """
    Logout user by blacklisting the refresh token.
    
    POST /api/auth/logout/
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="User Logout",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'refresh': openapi.Schema(type=openapi.TYPE_STRING, description='Refresh token'),
            },
            required=['refresh']
        ),
        responses={205: "Logout successful", 400: "Invalid token"}
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({
                    'success': False,
                    'message': 'Refresh token is required.'
                }, status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({
                'success': True,
                'message': 'Successfully logged out.'
            }, status=status.HTTP_205_RESET_CONTENT)

        except TokenError as e:
            return Response({
                'success': False,
                'message': 'Invalid or expired token.',
                'details': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    Retrieve or update the authenticated user's profile.
    
    GET  /api/auth/profile/  - View profile
    PUT  /api/auth/profile/  - Update profile
    PATCH /api/auth/profile/ - Partial update
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    @swagger_auto_schema(operation_summary="Get User Profile")
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    @swagger_auto_schema(operation_summary="Update User Profile")
    def put(self, request, *args, **kwargs):
        return super().put(request, *args, **kwargs)

    @swagger_auto_schema(operation_summary="Partial Update User Profile")
    def patch(self, request, *args, **kwargs):
        return super().patch(request, *args, **kwargs)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'success': True,
            'data': serializer.data
        })

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({
            'success': True,
            'message': 'Profile updated successfully.',
            'data': serializer.data
        })


class ChangePasswordView(APIView):
    """
    Change the authenticated user's password.
    
    POST /api/auth/change-password/
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_summary="Change Password",
        request_body=ChangePasswordSerializer,
        responses={200: "Password changed", 400: "Validation error"}
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            'success': True,
            'message': 'Password changed successfully.'
        }, status=status.HTTP_200_OK)