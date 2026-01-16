from rest_framework import viewsets, generics, permissions
from django.contrib.auth.models import User
from .models import Place, Post, Review, Bookmark, UserProfile
from .serializers import (
    PlaceSerializer, PostSerializer, ReviewSerializer,
    BookmarkSerializer, RegisterSerializer
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [permissions.IsAuthenticated]


class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user_profile = UserProfile.objects.get(user=self.request.user)
        serializer.save(user=user_profile)


class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user_profile = UserProfile.objects.get(user=self.request.user)
        serializer.save(user=user_profile)


class BookmarkViewSet(viewsets.ModelViewSet):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user_profile = UserProfile.objects.get(user=self.request.user)
        serializer.save(user=user_profile)
