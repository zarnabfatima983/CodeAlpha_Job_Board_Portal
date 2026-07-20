from django.urls import path
from .views import (
    ApplyForJobView, WithdrawApplicationView,
    UpdateApplicationStatusView, CandidateApplicationsView,
    EmployerApplicationsView,
)

urlpatterns = [
    path('apply/', ApplyForJobView.as_view(), name='apply-job'),
    path('my-applications/', CandidateApplicationsView.as_view(), name='my-applications'),
    path('employer-applications/', EmployerApplicationsView.as_view(), name='employer-applications'),
    path('<int:pk>/withdraw/', WithdrawApplicationView.as_view(), name='withdraw-application'),
    path('<int:pk>/status/', UpdateApplicationStatusView.as_view(), name='update-application-status'),
]