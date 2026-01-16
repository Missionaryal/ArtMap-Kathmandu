from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, CreatorProfile, Place, Post, Review, Bookmark


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'bio', 'is_creator']


class CreatorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreatorProfile
        fields = '__all__'


class PlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = '__all__'


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'


class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'


class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = '__all__'
