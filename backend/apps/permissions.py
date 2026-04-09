# permissions.py
# Custom permission classes for ArtMap.
# These control who is allowed to do what in the API.

from rest_framework import permissions


# Allows access only to users who are approved creators.
# Used when an endpoint should only be accessible to verified creator accounts.
class IsApprovedCreator(permissions.BasePermission):

    def has_permission(self, request, view):
        # Must be logged in first
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            profile = request.user.userprofile
            # The user must have applied as a creator
            if not profile.is_creator:
                return False
            # And their application must have been approved by an admin
            creator_profile = profile.creatorprofile
            return creator_profile.status == 'approved'
        except (AttributeError, Exception):
            return False


# Allows anyone to read (GET requests), but only approved creators can write (POST, PUT, DELETE).
# Used on the Places endpoint — anyone can browse places, but only creators can add them.
class IsApprovedCreatorOrReadOnly(permissions.BasePermission):

    def has_permission(self, request, view):
        # SAFE_METHODS = GET, HEAD, OPTIONS — these are read-only requests
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write requests require login
        if not request.user or not request.user.is_authenticated:
            return False

        # And the user must be an approved creator
        try:
            profile = request.user.userprofile
            if not profile.is_creator:
                return False
            creator_profile = profile.creatorprofile
            return creator_profile.status == 'approved'
        except (AttributeError, Exception):
            return False