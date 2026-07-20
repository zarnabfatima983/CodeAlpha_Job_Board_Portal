from django.contrib import admin
from .models import JobApplication


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = (
        'candidate', 'job', 'application_status', 'applied_at', 'updated_at'
    )
    list_filter = ('application_status', 'applied_at')
    search_fields = (
        'candidate__full_name', 'candidate__email',
        'job__title', 'job__employer__company_name'
    )
    list_editable = ('application_status',)
    date_hierarchy = 'applied_at'
    list_per_page = 25
    readonly_fields = ('applied_at', 'updated_at')
    raw_id_fields = ('candidate', 'job', 'resume')