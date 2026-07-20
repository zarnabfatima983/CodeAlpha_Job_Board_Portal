"""
Custom validators for resume file uploads.
"""

import os
from django.core.exceptions import ValidationError


def validate_pdf_file(value):
    """
    Validate that the uploaded file is a PDF and within size limit.
    
    Rules:
        - Must be a .pdf file
        - Maximum size: 5MB
    """
    # Check file extension
    ext = os.path.splitext(value.name)[1].lower()
    if ext != '.pdf':
        raise ValidationError(
            f'Only PDF files are allowed. Received: {ext}'
        )

    # Check file size (5MB = 5 * 1024 * 1024 bytes)
    max_size = 5 * 1024 * 1024
    if value.size > max_size:
        raise ValidationError(
            f'File size must not exceed 5MB. Current size: {value.size / (1024*1024):.2f}MB'
        )

    # Check content type
    if hasattr(value, 'content_type') and value.content_type != 'application/pdf':
        raise ValidationError('Invalid file type. Only PDF files are accepted.')