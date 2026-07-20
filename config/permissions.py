"""
Global custom permissions shared across apps.
"""

from rest_framework.permissions import BasePermission


class IsEmployer(BasePermission):
    """Allow access only to users with Employer role."""
    message = "Access denied. Employer role required."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'employer'
        )


class IsCandidate(BasePermission):
    """Allow access only to users with Candidate role."""
    message = "Access denied. Candidate role required."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'candidate'
        )


class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission: allow edits only to the object owner.
    Assumes the model has an 'owner', 'user', or 'candidate' field.
    """
    def has_object_permission(self, request, view, obj):
        # Read-only methods are always allowed
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True

        # Check various ownership fields
        owner = getattr(obj, 'owner', None) or getattr(obj, 'user', None) or getattr(obj, 'candidate', None)
        return owner == request.user


class IsJobOwner(BasePermission):
    """Allow edits only to the employer who owns the job."""
    message = "You can only modify your own job listings."

    def has_object_permission(self, request, view, obj):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return obj.employer.owner == request.user