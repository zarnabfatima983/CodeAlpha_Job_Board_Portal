from django.contrib import admin
from .models import Job, JobCategory


@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ('category_name', 'description', 'created_at')
    search_fields = ('category_name',)
    list_per_page = 25


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = (
        'title', 'employer', 'category', 'employment_type',
        'salary_min', 'salary_max', 'status', 'remote_option',
        'application_deadline', 'created_at'
    )
    list_filter = ('status', 'employment_type', 'remote_option', 'category', 'created_at')
    search_fields = ('title', 'description', 'employer__company_name', 'requirements')
    list_editable = ('status',)
    date_hierarchy = 'created_at'
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('employer', 'category')