"""
Custom exception handler for consistent error response format.
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework.exceptions import ValidationError


def custom_exception_handler(exc, context):
    """
    Custom exception handler that formats all errors consistently.
    
    Response format:
    {
        "success": false,
        "error": {
            "code": "error_code",
            "message": "Human readable message",
            "details": { ... }  // Optional field-level errors
        }
    }
    """
    # Convert Django ValidationError to DRF ValidationError
    if isinstance(exc, DjangoValidationError):
        exc = ValidationError(detail=exc.messages)

    # Call DRF's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Format the error response
        error_data = {
            'success': False,
            'error': {
                'status_code': response.status_code,
                'message': 'An error occurred.',
                'details': response.data if isinstance(response.data, dict) else {
                    'non_field_errors': response.data
                },
            }
        }

        # Extract a meaningful top-level message
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                error_data['error']['message'] = response.data['detail']
            elif 'non_field_errors' in response.data:
                errors = response.data['non_field_errors']
                error_data['error']['message'] = (
                    errors[0] if isinstance(errors, list) else errors
                )
            else:
                error_data['error']['message'] = 'Validation failed.'

        response.data = error_data

    return response