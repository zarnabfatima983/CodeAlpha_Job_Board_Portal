from django.contrib import admin
from .models import Employer


@admin.register(Employer)
class EmployerAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'owner', 'industry', 'company_size', 'location', 'created_at')
    list_filter = ('industry', 'company_size', 'location')
    search_fields = ('company_name', 'owner__email', 'owner__full_name', 'industry')
    list_editable = ('industry',)
    list_per_page = 25
    readonly_fields = ('created_at', 'updated_at')