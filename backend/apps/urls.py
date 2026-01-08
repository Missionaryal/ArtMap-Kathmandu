from django.urls import path
from .views import place_list, place_detail, post_list, review_list, bookmark_list

urlpatterns = [
    path('places/', place_list, name='place-list'),
    path('places/<int:pk>/', place_detail, name='place-detail'),
    path('posts/', post_list, name='post-list'),
    path('reviews/', review_list, name='review-list'),
    path('bookmarks/', bookmark_list, name='bookmark-list'),
]
