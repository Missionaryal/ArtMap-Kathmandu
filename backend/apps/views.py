from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import UserProfile, CreatorProfile, Place, Post, Review, Bookmark
from .serializers import (
    UserProfileSerializer,
    CreatorProfileSerializer,
    PlaceSerializer,
    PostSerializer,
    ReviewSerializer,
    BookmarkSerializer
)

# ---- Places ----
@api_view(['GET'])
def place_list(request):
    places = Place.objects.all()
    serializer = PlaceSerializer(places, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def place_detail(request, pk):
    try:
        place = Place.objects.get(pk=pk)
    except Place.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    serializer = PlaceSerializer(place)
    return Response(serializer.data)

# ---- Posts ----
@api_view(['GET'])
def post_list(request):
    posts = Post.objects.all()
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data)

# ---- Reviews ----
@api_view(['GET'])
def review_list(request):
    reviews = Review.objects.all()
    serializer = ReviewSerializer(reviews, many=True)
    return Response(serializer.data)

# ---- Bookmarks ----
@api_view(['GET'])
def bookmark_list(request):
    bookmarks = Bookmark.objects.all()
    serializer = BookmarkSerializer(bookmarks, many=True)
    return Response(serializer.data)
