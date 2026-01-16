from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlaceViewSet, PostViewSet, ReviewViewSet, BookmarkViewSet, RegisterView

router = DefaultRouter()
router.register(r'places', PlaceViewSet)
router.register(r'posts', PostViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'bookmarks', BookmarkViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('', include(router.urls)),
]
