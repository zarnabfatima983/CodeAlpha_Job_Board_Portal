from django.contrib import admin
from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'employer', 'candidate', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('title', 'message', 'employer__email', 'candidate__email')
    list_editable = ('is_read',)
    date_hierarchy = 'created_at'
    list_per_page = 25
    raw_id_fields = ('employer', 'candidate')