"""
Custom pagination classes for consistent API responses.
"""

from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """
    Standard pagination with configurable page size.
    Usage: ?page=1&page_size=20
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class SmallPagination(PageNumberPagination):
    """Smaller page size for lightweight endpoints."""
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50