from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, CreatorProfile, Place, Post, Review, Bookmark, PlacePhoto


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.CharField(write_only=True, required=False, default='explorer')
    business_name = serializers.CharField(write_only=True, required=False)
    business_description = serializers.CharField(write_only=True, required=False)
    category = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'role',
            'business_name', 'business_description', 'category'
        ]

    def validate_username(self, value):
        if ' ' in value:
            raise serializers.ValidationError("Username cannot contain spaces.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role', 'explorer')
        business_name = validated_data.pop('business_name', '')
        business_description = validated_data.pop('business_description', '')
        category = validated_data.pop('category', 'gallery')

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        if role == 'creator':
            user.is_active = False
            user.save()
            if not business_name:
                business_name = user.username

            user_profile = user.userprofile
            user_profile.is_creator = True
            user_profile.save()

            CreatorProfile.objects.create(
                user_profile=user_profile,
                business_name=business_name,
                business_description=business_description or f"Creator profile for {user.username}",
                category=category or 'gallery',
                status='pending',
                verified=False
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


def get_absolute_url(request, file_field):
    """Always returns a full absolute URL for any media file."""
    if not file_field:
        return None
    try:
        url = file_field.url
        if request:
            return request.build_absolute_uri(url)
        return f"http://localhost:8000{url}"
    except Exception:
        return None


class PlacePhotoSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = PlacePhoto
        fields = ['id', 'photo', 'photo_url', 'caption', 'created_at']

    def get_photo_url(self, obj):
        return get_absolute_url(self.context.get('request'), obj.photo)


class PostSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.user.username', read_only=True)
    place_name = serializers.CharField(source='place.name', read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 'user', 'user_name', 'place', 'place_name',
            'caption', 'photo', 'photo_url', 'is_public', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']
        extra_kwargs = {
            'photo': {'required': True}
        }

    def get_photo_url(self, obj):
        return get_absolute_url(self.context.get('request'), obj.photo)

    def validate_is_public(self, value):
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'yes')
        return value


class PlaceSerializer(serializers.ModelSerializer):
    photos = PlacePhotoSerializer(many=True, read_only=True)
    posts = PostSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    image = serializers.SerializerMethodField()

    class Meta:
        model = Place
        fields = [
            'id', 'name', 'description', 'category', 'location',
            'creator', 'latitude', 'longitude', 'image',
            'phone', 'website', 'email', 'operating_hours',
            'average_rating', 'review_count',
            'photos', 'posts',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['creator', 'created_at', 'updated_at']

    def get_image(self, obj):
        return get_absolute_url(self.context.get('request'), obj.image)


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.user.username', read_only=True)
    place_name = serializers.CharField(source='place.name', read_only=True)
    photo = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'user_name', 'place', 'place_name',
            'rating', 'comment', 'photo', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'place', 'created_at', 'updated_at']

    def get_photo(self, obj):
        return get_absolute_url(self.context.get('request'), obj.photo)


class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = '__all__'