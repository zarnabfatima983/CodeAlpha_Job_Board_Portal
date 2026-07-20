from django.urls import path
from .views import ResumeUploadView, ResumeListView, ResumeDetailView, ResumeDownloadView

urlpatterns = [
    path('', ResumeListView.as_view(), name='resume-list'),
    path('upload/', ResumeUploadView.as_view(), name='resume-upload'),
    path('<int:pk>/', ResumeDetailView.as_view(), name='resume-detail'),
    path('<int:pk>/download/', ResumeDownloadView.as_view(), name='resume-download'),
]