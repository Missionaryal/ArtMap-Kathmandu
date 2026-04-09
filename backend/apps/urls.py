# urls.py (apps/urls.py)
# This file maps URL paths to the views that handle them.
# Every API endpoint in ArtMap is defined here.

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlaceViewSet, PostViewSet, ReviewViewSet, BookmarkViewSet,
    RegisterView, place_reviews, review_detail, get_user_info,
    forgot_password, reset_password, toggle_bookmark, check_bookmark,
    get_user_bookmarks, place_posts, place_photos, get_creator_stats,
    CreatorProfileViewSet, get_creator_profile, get_creator_places,
    create_creator_place, update_creator_place, upload_place_photo,
    delete_place_photo, get_creator_tagged_posts, get_creator_reviews,
    get_upcoming_events, get_event_detail,
    get_creator_events, create_event, manage_event,
    book_event, get_event_bookings, get_all_creator_bookings,
    update_user, upload_profile_picture,
)

# The router automatically creates standard CRUD URLs for ViewSets.
# For example, registering 'places' creates:
#   GET  /api/places/       — list all places
#   POST /api/places/       — create a place
#   GET  /api/places/<id>/  — get one place
#   PUT  /api/places/<id>/  — update a place
#   DELETE /api/places/<id>/ — delete a place
router = DefaultRouter()
router.register(r'places', PlaceViewSet, basename='place')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'reviews', ReviewViewSet)
router.register(r'bookmarks', BookmarkViewSet)
router.register(r'creator/profile', CreatorProfileViewSet, basename='creator-profile')

urlpatterns = [
    # User registration
    path('register/', RegisterView.as_view(), name='register'),

    # Reviews for a specific place
    path('places/<int:place_id>/reviews/', place_reviews, name='place-reviews'),
    # Edit or delete a specific review
    path('reviews/<int:review_id>/', review_detail, name='review-detail'),

    # Get the logged-in user's info (used after login to determine role and redirect)
    path('user/me/', get_user_info, name='user-info'),
    path('auth/user/', get_user_info, name='user-info-alt'),
    # Update username
    path('auth/user/update/', update_user, name='update-user'),
    # Upload or remove profile picture
    path('auth/user/profile-picture/', upload_profile_picture, name='profile-picture'),

    # Creator dashboard stats (total places, reviews, bookings, etc.)
    path('creator/stats/', get_creator_stats, name='creator-stats'),
    # View or update the creator's own profile
    path('creator/profile/', get_creator_profile, name='get-creator-profile'),
    # Creator's places
    path('creator/places/', get_creator_places, name='creator-places'),
    path('creator/places/create/', create_creator_place, name='create-creator-place'),
    path('creator/places/<int:place_id>/update/', update_creator_place, name='update-creator-place'),
    # Photos for a creator's place gallery
    path('creator/places/<int:place_id>/photos/', upload_place_photo, name='upload-place-photo'),
    path('creator/photos/<int:photo_id>/delete/', delete_place_photo, name='delete-place-photo'),
    # Posts and reviews that users left at this creator's places
    path('creator/tagged-posts/', get_creator_tagged_posts, name='creator-tagged-posts'),
    path('creator/reviews/', get_creator_reviews, name='creator-reviews'),

    # Creator event management
    path('creator/events/', get_creator_events, name='creator-events'),
    path('creator/events/create/', create_event, name='create-event'),
    path('creator/events/<int:event_id>/', manage_event, name='manage-event'),

    # Creator booking management
    path('creator/bookings/', get_all_creator_bookings, name='all-creator-bookings'),
    path('creator/events/<int:event_id>/bookings/', get_event_bookings, name='event-bookings'),

    # Public event browsing (no login needed)
    path('events/', get_upcoming_events, name='upcoming-events'),
    path('events/<int:event_id>/', get_event_detail, name='event-detail'),
    # Anyone can book an event spot — payment is done at the venue
    path('events/<int:event_id>/book/', book_event, name='book-event'),

    # Password reset flow
    path('forgot-password/', forgot_password, name='forgot-password'),
    path('reset-password/<str:uidb64>/<str:token>/', reset_password, name='reset-password'),

    # Bookmark endpoints
    path('bookmarks/my/', get_user_bookmarks, name='user-bookmarks'),
    path('places/<int:place_id>/bookmark/', toggle_bookmark, name='toggle-bookmark'),
    path('places/<int:place_id>/check-bookmark/', check_bookmark, name='check-bookmark'),

    # Public posts and photos for a place detail page
    path('places/<int:place_id>/posts/', place_posts, name='place-posts'),
    path('places/<int:place_id>/photos/', place_photos, name='place-photos'),

    # Router URLs go last so they don't accidentally match custom paths above
    path('', include(router.urls)),
]