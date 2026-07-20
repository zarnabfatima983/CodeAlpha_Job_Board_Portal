from django.contrib import admin
from .models import Resume


@admin.register(Resume)
class ResumeAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'title', 'resume_file', 'uploaded_at')
    list_filter = ('uploaded_at',)
    search_fields = ('candidate__full_name', 'candidate__email', 'title')
    list_per_page = 25
    readonly_fields = ('uploaded_at',)
    raw_id_fields = ('candidate',)