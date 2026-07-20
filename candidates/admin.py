from django.contrib import admin
from .models import Candidate


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'experience', 'created_at')
    list_filter = ('title',)
    search_fields = ('user__full_name', 'user__email', 'title', 'skills')
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at')