"""
Notification model for employer and candidate alerts.
"""

from django.db import models
from django.conf import settings


class Notification(models.Model):
    """
    In-app notification for users.
    Sent to employers when candidates apply, and to candidates on status changes.
    """
    employer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='employer_notifications'
    )
    candidate = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='candidate_notifications'
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'notification'
        verbose_name_plural = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        recipient = self.employer or self.candidate
        return f"{self.title} -> {recipient}"