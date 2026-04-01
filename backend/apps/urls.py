from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlaceViewSet, PostViewSet, ReviewViewSet, BookmarkViewSet, 
    RegisterView, place_reviews, review_detail, get_user_info,
    forgot_password, reset_password, toggle_bookmark, check_bookmark, 
    get_user_bookmarks, place_posts, place_photos, get_creator_stats,
    CreatorProfileViewSet, get_creator_profile, get_creator_places,
    create_creator_place, update_creator_place, upload_place_photo,
    delete_place_photo, get_creator_tagged_posts, get_creator_reviews
)

router = DefaultRouter()
router.register(r'places', PlaceViewSet, basename='place')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'reviews', ReviewViewSet)
router.register(r'bookmarks', BookmarkViewSet)
router.register(r'creator/profile', CreatorProfileViewSet, basename='creator-profile')
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    
    # Review endpoints
    path('places/<int:place_id>/reviews/', place_reviews, name='place-reviews'),
    path('reviews/<int:review_id>/', review_detail, name='review-detail'),
    
    # User info endpoint
    path('user/me/', get_user_info, name='user-info'),
    
    # Creator endpoints - MUST come before router.urls
    path('creator/stats/', get_creator_stats, name='creator-stats'),
    path('creator/profile/', get_creator_profile, name='get-creator-profile'),
    path('creator/places/', get_creator_places, name='creator-places'),
    path('creator/places/create/', create_creator_place, name='create-creator-place'),
    path('creator/places/<int:place_id>/update/', update_creator_place, name='update-creator-place'),
    path('creator/places/<int:place_id>/photos/', upload_place_photo, name='upload-place-photo'),
    path('creator/photos/<int:photo_id>/delete/', delete_place_photo, name='delete-place-photo'),
    path('creator/tagged-posts/', get_creator_tagged_posts, name='creator-tagged-posts'),
    path('creator/reviews/', get_creator_reviews, name='creator-reviews'),
    
    # Password reset endpoints
    path('forgot-password/', forgot_password, name='forgot-password'),
    path('reset-password/<str:uidb64>/<str:token>/', reset_password, name='reset-password'),
    
    # Bookmark endpoints - MUST come BEFORE router.urls
    path('bookmarks/my/', get_user_bookmarks, name='user-bookmarks'),
    path('places/<int:place_id>/bookmark/', toggle_bookmark, name='toggle-bookmark'),
    path('places/<int:place_id>/check-bookmark/', check_bookmark, name='check-bookmark'),
    
    # Posts and Photos endpoints
    path('places/<int:place_id>/posts/', place_posts, name='place-posts'),
    path('places/<int:place_id>/photos/', place_photos, name='place-photos'),
    
    # Router URLs - This should be LAST
    path('', include(router.urls)),
]