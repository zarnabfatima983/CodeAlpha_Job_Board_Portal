"""
Root URL Configuration for Job Board Platform.
Routes all API endpoints to their respective apps.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# ──────────────────────────────────────────────
# Swagger / OpenAPI Schema
# ──────────────────────────────────────────────
schema_info = openapi.Info(
    title="Job Board Platform API",
    default_version='v1',
    description="""
    ## Job Board Platform - Complete REST API Documentation
    
    ### Authentication
    All authenticated endpoints require a JWT Bearer token.
    Obtain tokens via `/api/auth/login/`.
    
    ### Roles
    - **Employer**: Can create/manage jobs, view applications, update statuses.
    - **Candidate**: Can upload resumes, apply for jobs, track applications.
    
    ### Pagination
    All list endpoints return paginated results with `page` and `page_size` parameters.
    """,
    terms_of_service="https://www.jobboard.com/terms/",
    contact=openapi.Contact(email="admin@jobboard.com"),
    license=openapi.License(name="MIT License"),
)

schema_view = get_schema_view(
    schema_info,
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# ──────────────────────────────────────────────
# URL Patterns
# ──────────────────────────────────────────────
urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # API Endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/employers/', include('employers.urls')),
    path('api/candidates/', include('candidates.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/resumes/', include('resumes.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/reports/', include('reports.urls')),

    # Swagger Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

# ──────────────────────────────────────────────
# Admin Site Customization
# ──────────────────────────────────────────────
admin.site.site_header = "Job Board Platform Administration"
admin.site.site_title = "Job Board Admin"
admin.site.index_title = "Dashboard & Management"