"""
Notification Views: List, Create, Mark as Read, Delete.
"""

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from drf_yasg.utils import swagger_auto_schema

from .models import Notification
from .serializers import NotificationSerializer


class NotificationListView(generics.ListAPIView):
    """
    List notifications for the authenticated user.
    
    GET /api/notifications/
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(
            models.Q(employer=user) | models.Q(candidate=user)
        )


class NotificationCreateView(generics.CreateAPIView):
    """
    Create a notification (internal use / admin).
    
    POST /api/notifications/create/
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]


class MarkNotificationReadView(APIView):
    """
    Mark a notification as read.
    
    PATCH /api/notifications/<id>/read/
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(operation_summary="Mark Notification as Read")
    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(id=pk)
        except Notification.DoesNotExist:
            return Response({
                'success': False, 'message': 'Notification not found.'
            }, status=status.HTTP_404_NOT_FOUND)

        notification.is_read = True
        notification.save()
        return Response({
            'success': True,
            'message': 'Notification marked as read.',
            'data': NotificationSerializer(notification).data
        })


class MarkAllReadView(APIView):
    """
    Mark all notifications as read for the authenticated user.
    
    POST /api/notifications/mark-all-read/
    """
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(operation_summary="Mark All Notifications as Read")
    def post(self, request):
        from django.db.models import Q
        count = Notification.objects.filter(
            Q(employer=request.user) | Q(candidate=request.user),
            is_read=False
        ).update(is_read=True)

        return Response({
            'success': True,
            'message': f'{count} notifications marked as read.'
        })


class NotificationDeleteView(generics.DestroyAPIView):
    """
    Delete a notification.
    
    DELETE /api/notifications/<id>/
    """
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'

    def get_queryset(self):
        from django.db.models import Q
        return Notification.objects.filter(
            Q(employer=self.request.user) | Q(candidate=self.request.user)
        )