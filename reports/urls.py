from django.urls import path
from .views import PlatformReportView

urlpatterns = [
    path('platform/', PlatformReportView.as_view(), name='platform-report'),
]