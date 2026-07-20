from django.urls import path
from .views import EmployerCreateView, EmployerUpdateView, EmployerDashboardView

urlpatterns = [
    path('', EmployerCreateView.as_view(), name='employer-create'),
    path('profile/', EmployerUpdateView.as_view(), name='employer-profile'),
    path('dashboard/', EmployerDashboardView.as_view(), name='employer-dashboard'),
]