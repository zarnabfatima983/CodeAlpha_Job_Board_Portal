from django.urls import path
from .views import (
    JobCreateView, JobDetailView, JobListView,
    EmployerJobsView, OpenJobsView, ClosedJobsView,
    JobCategoryListView, JobCategoryCreateView,
)

urlpatterns = [
    path('', JobCreateView.as_view(), name='job-create'),
    path('list/', JobListView.as_view(), name='job-list'),
    path('my-jobs/', EmployerJobsView.as_view(), name='employer-jobs'),
    path('open/', OpenJobsView.as_view(), name='open-jobs'),
    path('closed/', ClosedJobsView.as_view(), name='closed-jobs'),
    path('categories/', JobCategoryListView.as_view(), name='category-list'),
    path('categories/create/', JobCategoryCreateView.as_view(), name='category-create'),
    path('<int:pk>/', JobDetailView.as_view(), name='job-detail'),
]