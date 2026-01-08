from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlaceViewSet,
    PostViewSet,
    ReviewViewSet,
    BookmarkViewSet,
    RegisterView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'places', PlaceViewSet)
router.register(r'posts', PostViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'bookmarks', BookmarkViewSet)

urlpatterns = [
    path('', include(router.urls)),          # all ModelViewSet endpoints
    path('register/', RegisterView.as_view(), name='register'),  # public registration
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # login
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'), # refresh JWT
]
