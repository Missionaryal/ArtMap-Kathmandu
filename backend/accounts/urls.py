from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlaceViewSet, PostViewSet, ReviewViewSet

router = DefaultRouter()
router.register(r'places', PlaceViewSet)
router.register(r'posts', PostViewSet)
router.register(r'reviews', ReviewViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
