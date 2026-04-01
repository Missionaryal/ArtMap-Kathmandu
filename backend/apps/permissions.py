from rest_framework import permissions

class IsApprovedCreator(permissions.BasePermission):
    """
    Allows access only to users who are marked as creators AND have an approved CreatorProfile.
    """
    def has_permission(self, request, view):
        # Must be authenticated
        if not request.user or not request.user.is_authenticated:
            return False
            
        # Must have a UserProfile marked as creator
        try:
            profile = request.user.userprofile
            if not profile.is_creator:
                return False
                
            # Must have an approved CreatorProfile
            creator_profile = profile.creatorprofile
            return creator_profile.status == 'approved'
            
        except (AttributeError, Exception):
            return False

class IsApprovedCreatorOrReadOnly(permissions.BasePermission):
    """
    Allow read-only access to anyone, but write access only to approved creators.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
            
        if not request.user or not request.user.is_authenticated:
            return False

        try:
            profile = request.user.userprofile
            if not profile.is_creator:
                return False
                
            creator_profile = profile.creatorprofile
            return creator_profile.status == 'approved'
        except (AttributeError, Exception):
            return False
