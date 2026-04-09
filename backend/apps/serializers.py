# serializers.py
# Serializers convert Django model objects to JSON (for API responses)
# and validate incoming JSON data before saving to the database.

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, CreatorProfile, Place, Post, Review, Bookmark, PlacePhoto, Event, Booking


# Handles new user registration for both regular users and creators.
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    # 'role' decides if this is a regular user or a creator application
    role = serializers.CharField(write_only=True, required=False, default='explorer')
    # These fields are only needed when registering as a creator
    business_name = serializers.CharField(write_only=True, required=False)
    business_description = serializers.CharField(write_only=True, required=False)
    category = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'role', 'business_name', 'business_description', 'category']

    def validate_username(self, value):
        # Usernames cannot have spaces
        if ' ' in value:
            raise serializers.ValidationError("Username cannot contain spaces.")
        # Check case-insensitively so 'John' and 'john' are treated as the same username
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def validate_email(self, value):
        # Check case-insensitively — Gmail and GMAIL are the same email
        if User.objects.filter(email__iexact=value.strip()).exists():
            raise serializers.ValidationError("An account with this email already exists. Please sign in instead.")
        # Store emails in lowercase to keep the database consistent
        return value.strip().lower()

    def validate_password(self, value):
        if len(value) < 6:
            raise serializers.ValidationError("Password must be at least 6 characters.")
        # A password like '123456' is too easy to guess
        if value.isdigit():
            raise serializers.ValidationError("Password cannot be entirely numeric.")
        return value

    def create(self, validated_data):
        # Pull out the extra fields before creating the User object
        role = validated_data.pop('role', 'explorer')
        business_name = validated_data.pop('business_name', '')
        business_description = validated_data.pop('business_description', '')
        category = validated_data.pop('category', 'gallery')

        # Create the Django user account
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        if role == 'creator':
            # Creator accounts are disabled until an admin approves them
            user.is_active = False
            user.save()
            if not business_name:
                business_name = user.username
            # Mark the user profile as a creator
            user_profile = user.userprofile
            user_profile.is_creator = True
            user_profile.save()
            # Create a pending creator profile waiting for admin review
            CreatorProfile.objects.create(
                user_profile=user_profile,
                business_name=business_name,
                business_description=business_description or f"Creator profile for {user.username}",
                category=category or 'gallery',
                status='pending',
                verified=False
            )
        return user


# Basic user info serializer used inside other serializers
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


# Used when we need to return a user's profile info in an API response
class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'bio', 'is_creator']


# Used for reading/writing creator profile data from the API
class CreatorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreatorProfile
        fields = '__all__'


# Helper function to build a full URL for an uploaded file.
# Without this, the API would return just '/media/photo.jpg' instead of
# 'http://localhost:8000/media/photo.jpg', which the browser can't load.
def get_absolute_url(request, file_field):
    if not file_field:
        return None
    try:
        url = file_field.url
        if request:
            return request.build_absolute_uri(url)
        # Fallback if request object is not available
        return f"http://localhost:8000{url}"
    except Exception:
        return None


# Serializer for photos uploaded by creators to a place's gallery
class PlacePhotoSerializer(serializers.ModelSerializer):
    # photo_url gives the full http://... URL the browser can display
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = PlacePhoto
        fields = ['id', 'photo', 'photo_url', 'caption', 'created_at']

    def get_photo_url(self, obj):
        return get_absolute_url(self.context.get('request'), obj.photo)


# Serializer for user posts (photos tagged to a place)
class PostSerializer(serializers.ModelSerializer):
    # These read-only fields make the response more useful without extra API calls
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
        extra_kwargs = {'photo': {'required': True}}

    def get_photo_url(self, obj):
        return get_absolute_url(self.context.get('request'), obj.photo)

    def validate_is_public(self, value):
        # Handle cases where the frontend sends the string 'true' instead of a boolean
        if isinstance(value, str):
            return value.lower() in ('true', '1', 'yes')
        return value


# Serializer for cultural places (galleries, museums, etc.)
class PlaceSerializer(serializers.ModelSerializer):
    # Nested serializers so the API returns full photo and post data in one request
    photos = PlacePhotoSerializer(many=True, read_only=True)
    posts = PostSerializer(many=True, read_only=True)
    # These come from @property methods on the Place model
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    # Use SerializerMethodField so we can return the full URL instead of just the file path
    image = serializers.SerializerMethodField()

    class Meta:
        model = Place
        fields = [
            'id', 'name', 'description', 'category', 'location',
            'creator', 'latitude', 'longitude', 'image',
            'phone', 'website', 'email', 'operating_hours',
            'average_rating', 'review_count', 'photos', 'posts',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['creator', 'created_at', 'updated_at']

    def get_image(self, obj):
        return get_absolute_url(self.context.get('request'), obj.image)


# Serializer for events (workshops, classes, exhibitions, etc.)
class EventSerializer(serializers.ModelSerializer):
    # Extra read-only fields for convenience in the frontend
    creator_name = serializers.CharField(source='creator.business_name', read_only=True)
    place_name = serializers.CharField(source='place.name', read_only=True)
    place_location = serializers.CharField(source='place.location', read_only=True)
    # These come from @property methods on the Event model
    spots_left = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)
    is_upcoming = serializers.BooleanField(read_only=True)
    image_url = serializers.SerializerMethodField()
    booking_count = serializers.SerializerMethodField()

    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'event_type',
            'image', 'image_url',
            'date', 'start_time', 'duration_hours',
            'price', 'is_free',
            'total_spots', 'spots_taken', 'spots_left', 'is_full',
            'is_published', 'is_cancelled', 'is_upcoming',
            'creator', 'creator_name',
            'place', 'place_name', 'place_location',
            'booking_count',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['creator', 'created_at', 'updated_at']
        extra_kwargs = {
            'image': {'required': False, 'allow_null': True},
            'description': {'required': False, 'allow_blank': True},
            'place': {'required': False, 'allow_null': True},
        }

    def get_image_url(self, obj):
        return get_absolute_url(self.context.get('request'), obj.image)

    def get_booking_count(self, obj):
        return obj.bookings.count()

    def validate_price(self, value):
        # If no price is sent, default to 0 instead of raising an error
        if value is None or value == '':
            return 0
        return value


# Serializer for event bookings — includes event details for display
class BookingSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_date = serializers.DateField(source='event.date', read_only=True)
    event_price = serializers.DecimalField(source='event.price', max_digits=10, decimal_places=2, read_only=True)
    is_free = serializers.BooleanField(source='event.is_free', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'event', 'event_title', 'event_date', 'event_price', 'is_free',
            'name', 'email', 'phone', 'spots', 'created_at'
        ]
        read_only_fields = ['created_at']


# Serializer for place reviews (star rating + comment + optional photo)
class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.user.username', read_only=True)
    place_name = serializers.CharField(source='place.name', read_only=True)

    # 'photo' is a writable ImageField so the uploaded file gets saved to the database.
    # Previously this was a SerializerMethodField (read-only), which caused uploads to be silently ignored.
    photo = serializers.ImageField(required=False, allow_null=True)

    # 'photo_url' returns the full http://... URL so the browser can display the image.
    # We need this separate from 'photo' because ImageField returns just the file path on read.
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = [
            'id', 'user', 'user_name', 'place', 'place_name',
            'rating', 'comment', 'photo', 'photo_url',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'place', 'created_at', 'updated_at']

    def get_photo_url(self, obj):
        return get_absolute_url(self.context.get('request'), obj.photo)


# Simple serializer for bookmarks — just stores which user saved which place
class BookmarkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bookmark
        fields = '__all__'