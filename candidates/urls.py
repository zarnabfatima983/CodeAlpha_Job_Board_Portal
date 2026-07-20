from django.urls import path
from .views import CandidateCreateView, CandidateUpdateView, CandidateDashboardView

urlpatterns = [
    path('', CandidateCreateView.as_view(), name='candidate-create'),
    path('profile/', CandidateUpdateView.as_view(), name='candidate-profile'),
    path('dashboard/', CandidateDashboardView.as_view(), name='candidate-dashboard'),
]