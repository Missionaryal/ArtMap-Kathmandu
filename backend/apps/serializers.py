from rest_framework import serializers
from .models import UserProfile, CreatorProfile, Place, Post, Review, Bookmark
from django.contrib.auth.models import User

# User serializer
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

# UserProfile serializer
class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'profile_picture', 'bio', 'is_creator']

# CreatorProfile serializer
class CreatorProfileSerializer(serializers.ModelSerializer):
    user_profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = CreatorProfile
        fields = ['id', 'user_profile', 'business_name', 'business_description', 'category', 'verified']

# Place serializer
class PlaceSerializer(serializers.ModelSerializer):
    creator = CreatorProfileSerializer(read_only=True)

    class Meta:
        model = Place
        fields = ['id', 'name', 'description', 'category', 'creator', 'latitude', 'longitude', 'created_at']

# Post serializer
class PostSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    place = PlaceSerializer(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'user', 'place', 'caption', 'photo', 'is_public', 'created_at']

# Review serializer
class ReviewSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    place = PlaceSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'user', 'place', 'rating', 'comment', 'created_at']

# Bookmark serializer
class BookmarkSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    place = PlaceSerializer(read_only=True)
    post = PostSerializer(read_only=True)

    class Meta:
        model = Bookmark
        fields = ['id', 'user', 'place', 'post', 'created_at']
