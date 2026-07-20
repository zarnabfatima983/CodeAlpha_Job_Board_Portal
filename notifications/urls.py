from django.urls import path
from .views import (
    NotificationListView, NotificationCreateView,
    MarkNotificationReadView, MarkAllReadView, NotificationDeleteView,
)

urlpatterns = [
    path('', NotificationListView.as_view(), name='notification-list'),
    path('create/', NotificationCreateView.as_view(), name='notification-create'),
    path('mark-all-read/', MarkAllReadView.as_view(), name='mark-all-read'),
    path('<int:pk>/read/', MarkNotificationReadView.as_view(), name='notification-read'),
    path('<int:pk>/delete/', NotificationDeleteView.as_view(), name='notification-delete'),
]