# views.py
# This file contains all the API logic for ArtMap.
# Each function or class here handles a specific API endpoint.
# Views receive HTTP requests, do the work, and return JSON responses.

from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings as django_settings
from django.shortcuts import get_object_or_404

from rest_framework import viewsets, generics, permissions, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Place, Post, Review, Bookmark, UserProfile, PlacePhoto, CreatorProfile, Event, Booking
from .serializers import (
    PlaceSerializer, PostSerializer, ReviewSerializer, BookmarkSerializer,
    RegisterSerializer, PlacePhotoSerializer, CreatorProfileSerializer,
    EventSerializer, BookingSerializer,
)
from .permissions import IsApprovedCreatorOrReadOnly


# Handles POST /api/register/
# Creates a new user account (regular user or creator application)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": {"id": user.id, "username": user.username, "email": user.email},
            "message": "Account created successfully"
        }, status=status.HTTP_201_CREATED)


# Handles all CRUD operations for Places (GET, POST, PUT, DELETE)
# Only approved creators can create or edit places — everyone can read
class PlaceViewSet(viewsets.ModelViewSet):
    serializer_class = PlaceSerializer
    permission_classes = [IsApprovedCreatorOrReadOnly]

    def get_queryset(self):
        # If the request includes ?my_places=true, return only this creator's places
        if self.request.query_params.get('my_places') == 'true':
            if self.request.user.is_authenticated:
                try:
                    creator_profile = self.request.user.userprofile.creatorprofile
                    return Place.objects.filter(
                        creator=creator_profile
                    ).prefetch_related('photos', 'posts', 'reviews')
                except Exception:
                    return Place.objects.none()

        # Otherwise return all places with their related data loaded in one query
        queryset = Place.objects.all().prefetch_related('photos', 'posts', 'reviews')

        # Filter by category if ?category=... is provided in the URL
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)

        return queryset

    def get_serializer_context(self):
        # Pass the request to the serializer so it can build absolute URLs for images
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        # Automatically link the new place to the creator who is logged in
        creator_profile = self.request.user.userprofile.creatorprofile
        serializer.save(creator=creator_profile)


# Handles all CRUD operations for Posts (user photos tagged to a place)
class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # ?my_posts=true — return only this user's own posts (for profile page)
        if self.request.query_params.get('my_posts') == 'true':
            if self.request.user.is_authenticated:
                try:
                    return Post.objects.filter(user=self.request.user.userprofile)
                except Exception:
                    return Post.objects.none()
        # ?my_places=true — return ALL posts (pending + approved) tagged at this creator's places
        # Only used by the creator dashboard TaggedPosts section
        if self.request.query_params.get('my_places') == 'true':
            if self.request.user.is_authenticated:
                try:
                    creator_profile = self.request.user.userprofile.creatorprofile
                    return Post.objects.filter(place__creator=creator_profile)
                except Exception:
                    return Post.objects.none()
        # Default — return all public AND approved posts only
        # This is what the public place detail page sees
        return Post.objects.filter(is_public=True, is_approved=True)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        # Get or create a UserProfile for the logged-in user, then attach it to the post
        # New posts are saved with is_approved=False by default — creator must approve
        user_profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        serializer.save(user=user_profile)

    def get_permissions(self):
        # Creating, editing, or deleting requires login. Reading is open to everyone.
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [IsAuthenticatedOrReadOnly()]


# Handles CRUD for reviews through the router
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        user_profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        serializer.save(user=user_profile)


# Handles CRUD for bookmarks through the router
class BookmarkViewSet(viewsets.ModelViewSet):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user_profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        serializer.save(user=user_profile)


# GET /api/places/<id>/reviews/ — fetch all reviews for a place
# POST /api/places/<id>/reviews/ — submit a new review for a place
@api_view(["GET", "POST"])
def place_reviews(request, place_id):
    try:
        place = Place.objects.get(id=place_id)
    except Place.DoesNotExist:
        return Response({"error": "Place not found"}, status=404)

    if request.method == "GET":
        reviews = Review.objects.filter(place=place).order_by("-created_at")
        serializer = ReviewSerializer(reviews, many=True, context={"request": request})
        return Response(serializer.data)

    # POST — submit a new review
    if not request.user.is_authenticated:
        return Response({"error": "Login required"}, status=401)

    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)

    # Each user can only review a place once
    if Review.objects.filter(user=user_profile, place=place).exists():
        return Response({"error": "You have already reviewed this place"}, status=400)

    serializer = ReviewSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        review = serializer.save(user=user_profile, place=place)
        return Response(
            ReviewSerializer(review, context={"request": request}).data,
            status=201
        )
    return Response(serializer.errors, status=400)


# PUT /api/reviews/<id>/ — edit your own review
# DELETE /api/reviews/<id>/ — delete your own review
@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def review_detail(request, review_id):
    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        return Response({"error": "Review not found"}, status=404)

    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)

    # Only the person who wrote the review can edit or delete it
    if review.user != user_profile:
        return Response({"error": "Not allowed"}, status=403)

    if request.method == "PUT":
        serializer = ReviewSerializer(
            review, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            updated_review = serializer.save()
            return Response(
                ReviewSerializer(updated_review, context={"request": request}).data
            )
        return Response(serializer.errors, status=400)

    review.delete()
    return Response({"message": "Deleted"}, status=204)


# GET /api/user/me/ — returns the logged-in user's full profile info
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    user_profile, _ = UserProfile.objects.get_or_create(user=user)
    profile_picture_url = None
    if user_profile.profile_picture:
        profile_picture_url = request.build_absolute_uri(user_profile.profile_picture.url)

    user_info = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "date_joined": user.date_joined.isoformat(),
        "profile_picture": profile_picture_url,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser,
        "is_creator": False,
        "creator_status": None,
        "business_name": None,
    }
    try:
        profile = user.userprofile
        if profile.is_creator:
            user_info["is_creator"] = True
            creator_profile = profile.creatorprofile
            user_info["creator_status"] = creator_profile.status
            user_info["business_name"] = creator_profile.business_name
    except Exception:
        pass
    return Response(user_info)


# PATCH /api/auth/user/update/ — update the logged-in user's username
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_user(request):
    user = request.user
    username = request.data.get("username")
    if username:
        if User.objects.filter(username=username).exclude(id=user.id).exists():
            return Response({"username": ["This username is already taken."]}, status=400)
        user.username = username
        user.save()

    user_profile, _ = UserProfile.objects.get_or_create(user=user)
    profile_picture_url = None
    if user_profile.profile_picture:
        profile_picture_url = request.build_absolute_uri(user_profile.profile_picture.url)

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "profile_picture": profile_picture_url,
    })


# POST /api/auth/user/profile-picture/ — upload a new profile picture
# DELETE /api/auth/user/profile-picture/ — remove the current profile picture
@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def upload_profile_picture(request):
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if request.method == "DELETE":
        user_profile.profile_picture = None
        user_profile.save()
        return Response({"message": "Profile picture removed", "profile_picture": None})

    if 'profile_picture' not in request.FILES:
        return Response({"error": "No image provided"}, status=400)
    user_profile.profile_picture = request.FILES['profile_picture']
    user_profile.save()
    return Response({
        "profile_picture": request.build_absolute_uri(user_profile.profile_picture.url)
    })


# GET /api/creator/stats/ — returns dashboard numbers for a creator
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_creator_stats(request):
    try:
        profile = request.user.userprofile
        if not profile.is_creator:
            return Response({"error": "Not a creator"}, status=403)
        creator_profile = profile.creatorprofile
        return Response({
            "total_places": Place.objects.filter(creator=creator_profile).count(),
            "total_posts": Post.objects.filter(place__creator=creator_profile).count(),
            "total_photos": PlacePhoto.objects.filter(place__creator=creator_profile).count(),
            "total_reviews": Review.objects.filter(place__creator=creator_profile).count(),
            "total_events": Event.objects.filter(creator=creator_profile).count(),
            "total_bookings": Booking.objects.filter(event__creator=creator_profile).count(),
            "total_bookmarks": Bookmark.objects.filter(place__creator=creator_profile).count(),
            # Count how many tagged posts are still waiting for approval
            "pending_posts": Post.objects.filter(
                place__creator=creator_profile, is_approved=False, is_public=True
            ).count(),
            "status": creator_profile.status,
            "verified": creator_profile.verified,
        })
    except Exception as e:
        return Response({"error": str(e)}, status=400)


# ViewSet for managing creator profile data through the router
class CreatorProfileViewSet(viewsets.ModelViewSet):
    serializer_class = CreatorProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return CreatorProfile.objects.filter(user_profile=self.request.user.userprofile)
        except Exception:
            return CreatorProfile.objects.none()

    def perform_create(self, serializer):
        serializer.save(user_profile=self.request.user.userprofile)


# POST /api/forgot-password/ — sends a password reset email
@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get("email", "").strip().lower()
    if not email:
        return Response({"error": "Email is required"}, status=400)

    user = User.objects.filter(email__iexact=email).first()
    success_msg = {"message": "If an account with this email exists, a reset link has been sent."}

    if not user:
        return Response(success_msg)

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_link = f"{django_settings.FRONTEND_URL}/reset-password/{uid}/{token}"

    print(f"\n{'='*50}")
    print(f"PASSWORD RESET LINK for {email}:")
    print(f"{reset_link}")
    print(f"{'='*50}\n")

    try:
        send_mail(
            subject="Reset your ArtMap password",
            message=(
                f"Hi {user.username},\n\n"
                f"You requested a password reset for your ArtMap account.\n\n"
                f"Click the link below to reset your password:\n"
                f"{reset_link}\n\n"
                f"This link expires in 1 hour.\n\n"
                f"If you did not request this, you can ignore this email.\n\n"
                f"— ArtMap Kathmandu"
            ),
            from_email=django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Email send error: {e}")
        return Response(success_msg)

    return Response(success_msg)


# POST /api/reset-password/<uid>/<token>/ — sets a new password using the reset link
@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request, uidb64, token):
    password = request.data.get("password")
    if not password or len(password) < 6:
        return Response({"error": "Password must be at least 6 characters"}, status=400)
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception:
        return Response({"error": "Invalid reset link"}, status=400)
    if not default_token_generator.check_token(user, token):
        return Response({"error": "Reset link has expired. Please request a new one."}, status=400)
    user.set_password(password)
    user.save()
    return Response({"message": "Password reset successful"})


# POST /api/places/<id>/bookmark/ — toggle bookmark on a place
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_bookmark(request, place_id):
    try:
        place = Place.objects.get(id=place_id)
    except Place.DoesNotExist:
        return Response({"error": "Place not found"}, status=404)
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    bookmark = Bookmark.objects.filter(user=user_profile, place=place).first()
    if bookmark:
        bookmark.delete()
        return Response({"bookmarked": False})
    Bookmark.objects.create(user=user_profile, place=place)
    return Response({"bookmarked": True}, status=201)


# GET /api/places/<id>/check-bookmark/ — check if the user has bookmarked this place
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_bookmark(request, place_id):
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    exists = Bookmark.objects.filter(user=user_profile, place_id=place_id).exists()
    return Response({"bookmarked": exists})


# GET /api/bookmarks/my/ — get all places the logged-in user has bookmarked
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_bookmarks(request):
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    bookmarks = Bookmark.objects.filter(user=user_profile).select_related('place')
    places = [b.place for b in bookmarks]
    serializer = PlaceSerializer(places, many=True, context={"request": request})
    return Response(serializer.data)


# Custom JWT login serializer that accepts email instead of username
class EmailAuthTokenSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop("username", None)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        try:
            users = User.objects.filter(email__iexact=email)
            user = None
            inactive_match = None
            for u in users:
                if u.check_password(password):
                    if u.is_active:
                        user = u
                        break
                    else:
                        inactive_match = u
            if not user and inactive_match:
                user = inactive_match
            if not user:
                raise AuthenticationFailed("No account found with these credentials.")
        except AuthenticationFailed:
            raise
        except Exception:
            raise AuthenticationFailed("No account found with these credentials.")

        if not user.is_active:
            try:
                user_profile = user.userprofile
                if user_profile.is_creator:
                    creator_profile = user_profile.creatorprofile
                    if creator_profile.status == "rejected":
                        raise AuthenticationFailed("Your creator application was not approved.")
                    raise AuthenticationFailed("Your creator account is under review. This usually takes 24-48 hours.")
            except AuthenticationFailed:
                raise
            except Exception:
                pass
            raise AuthenticationFailed("This account is inactive. Please contact support.")

        try:
            user_profile = user.userprofile
            if user_profile.is_creator:
                creator_profile = user_profile.creatorprofile
                if creator_profile.status == "pending":
                    raise AuthenticationFailed("Your creator account is under review. This usually takes 24-48 hours.")
                elif creator_profile.status == "rejected":
                    raise AuthenticationFailed("Your creator application was not approved.")
        except AuthenticationFailed:
            raise
        except Exception:
            pass

        refresh = self.get_token(user)
        return {"refresh": str(refresh), "access": str(refresh.access_token)}


# The actual login view using our custom email-based serializer
class EmailAuthTokenView(TokenObtainPairView):
    serializer_class = EmailAuthTokenSerializer


# GET /api/places/<id>/posts/ — get ONLY approved public posts tagged at a place
# This is used by the public PlaceDetailPage — unapproved posts are hidden
@api_view(["GET"])
def place_posts(request, place_id):
    try:
        place = Place.objects.get(id=place_id)
    except Place.DoesNotExist:
        return Response({"error": "Place not found"}, status=404)
    # Only return posts that are public AND approved by the creator
    posts = Post.objects.filter(place=place, is_public=True, is_approved=True)
    serializer = PostSerializer(posts, many=True, context={"request": request})
    return Response(serializer.data)


# GET /api/places/<id>/photos/ — get all gallery photos uploaded by the creator
@api_view(["GET"])
def place_photos(request, place_id):
    try:
        place = Place.objects.get(id=place_id)
    except Place.DoesNotExist:
        return Response({"error": "Place not found"}, status=404)
    photos = PlacePhoto.objects.filter(place=place)
    serializer = PlacePhotoSerializer(photos, many=True, context={"request": request})
    return Response(serializer.data)


# GET/PUT /api/creator/profile/ — view or update the creator's own profile
@api_view(["GET", "PUT"])
@permission_classes([IsAuthenticated])
def get_creator_profile(request):
    try:
        user_profile = request.user.userprofile
        if not user_profile.is_creator:
            return Response({"error": "Not a creator"}, status=403)
        creator_profile = user_profile.creatorprofile
        if request.method == "GET":
            serializer = CreatorProfileSerializer(creator_profile)
            return Response(serializer.data)
        serializer = CreatorProfileSerializer(creator_profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    except AttributeError:
        return Response({"error": "Creator profile not found"}, status=404)


# GET /api/creator/places/ — list all places belonging to this creator
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_creator_places(request):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        places = Place.objects.filter(
            creator=creator_profile
        ).prefetch_related('photos', 'posts', 'reviews')
        serializer = PlaceSerializer(places, many=True, context={"request": request})
        return Response(serializer.data)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)


# POST /api/creator/places/create/ — add a new place (approved creators only)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_creator_place(request):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        if creator_profile.status != 'approved':
            return Response({"error": "Only approved creators can create places"}, status=403)
        serializer = PlaceSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(creator=creator_profile)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    except AttributeError:
        return Response({"error": "Creator profile not found"}, status=404)


# PUT /api/creator/places/<id>/update/ — update a place (only the owner can do this)
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_creator_place(request, place_id):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        place = Place.objects.get(id=place_id, creator=creator_profile)
        serializer = PlaceSerializer(
            place, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    except Place.DoesNotExist:
        return Response({"error": "Place not found or not yours"}, status=404)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)


# POST /api/creator/places/<id>/photos/ — upload a new photo to a place gallery
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_place_photo(request, place_id):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        place = Place.objects.get(id=place_id, creator=creator_profile)
        serializer = PlacePhotoSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(place=place, uploaded_by=request.user.userprofile)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    except Place.DoesNotExist:
        return Response({"error": "Place not found or not yours"}, status=404)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)


# DELETE /api/creator/photos/<id>/delete/ — remove a photo from a place gallery
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_place_photo(request, photo_id):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        photo = PlacePhoto.objects.get(id=photo_id, place__creator=creator_profile)
        photo.delete()
        return Response({"message": "Photo deleted"}, status=204)
    except PlacePhoto.DoesNotExist:
        return Response({"error": "Photo not found"}, status=404)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)


# GET /api/creator/tagged-posts/ — ALL posts (pending + approved) at the creator's place
# The creator sees everything so they can decide what to approve or remove
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_creator_tagged_posts(request):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        # Return ALL public posts — both pending and approved — for creator review
        posts = Post.objects.filter(
            place__creator=creator_profile, is_public=True
        ).select_related('user__user')
        data = [
            {
                'id': p.id,
                'photo': request.build_absolute_uri(p.photo.url) if p.photo else None,
                'caption': p.caption,
                'is_approved': p.is_approved,
                'created_at': p.created_at,
                'user': {
                    'username': p.user.user.username,
                    'profile_picture': request.build_absolute_uri(p.user.profile_picture.url)
                    if p.user.profile_picture else None,
                }
            }
            for p in posts
        ]
        return Response(data)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)


# POST /api/creator/tagged-posts/<id>/approve/ — approve a tagged post
# Once approved, the post becomes visible on the public place detail page
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_tagged_post(request, post_id):
    try:
        creator_profile = request.user.userprofile.creatorprofile
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)

    # get_object_or_404 ensures the post both exists and belongs to this creator's place
    post = get_object_or_404(Post, id=post_id, place__creator=creator_profile)
    post.is_approved = True
    post.save()
    return Response({"message": "Post approved", "id": post.id, "is_approved": True})


# DELETE /api/creator/tagged-posts/<id>/remove/ — remove a tagged post
# The post is permanently deleted — the user who posted it will no longer see it tagged here
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_tagged_post(request, post_id):
    try:
        creator_profile = request.user.userprofile.creatorprofile
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)

    post = get_object_or_404(Post, id=post_id, place__creator=creator_profile)
    post.delete()
    return Response({"message": "Post removed"}, status=204)


# GET /api/creator/reviews/ — all reviews left at this creator's places
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_creator_reviews(request):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        reviews = Review.objects.filter(
            place__creator=creator_profile
        ).select_related('user__user', 'place')
        serializer = ReviewSerializer(reviews, many=True, context={"request": request})
        return Response(serializer.data)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)


# GET /api/events/ — get all upcoming published events (public, no login needed)
@api_view(["GET"])
def get_upcoming_events(request):
    today = timezone.now().date()
    events = Event.objects.filter(
        date__gte=today, is_published=True, is_cancelled=False
    ).select_related('creator', 'place').order_by('date','start_time')
    serializer = EventSerializer(events, many=True, context={"request": request})
    return Response(serializer.data)


# GET /api/events/<id>/ — get full details for one event
@api_view(["GET"])
def get_event_detail(request, event_id):
    try:
        event = Event.objects.get(id=event_id, is_published=True)
        serializer = EventSerializer(event, context={"request": request})
        return Response(serializer.data)
    except Event.DoesNotExist:
        return Response({"error": "Event not found"}, status=404)


# GET /api/creator/events/ — list all events created by this creator
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_creator_events(request):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        events = Event.objects.filter(
            creator=creator_profile
        ).order_by('date', 'start_time')
        serializer = EventSerializer(events, many=True, context={"request": request})
        return Response(serializer.data)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)


# POST /api/creator/events/create/ — create a new event (approved creators only)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_event(request):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        if creator_profile.status != 'approved':
            return Response({"error": "Only approved creators can create events"}, status=403)
        serializer = EventSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(creator=creator_profile)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=404)


# PATCH /api/creator/events/<id>/ — update an event
# DELETE /api/creator/events/<id>/ — delete an event
@api_view(["PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def manage_event(request, event_id):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        event = Event.objects.get(id=event_id, creator=creator_profile)
    except Event.DoesNotExist:
        return Response({"error": "Event not found or not yours"}, status=404)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)

    if request.method == "PATCH":
        serializer = EventSerializer(
            event, data=request.data, partial=True, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    event.delete()
    return Response({"message": "Event deleted"}, status=204)


# POST /api/events/<id>/book/ — book spots at an event (no login required)
@api_view(["POST"])
@permission_classes([AllowAny])
def book_event(request, event_id):
    try:
        event = Event.objects.get(id=event_id, is_published=True, is_cancelled=False)
    except Event.DoesNotExist:
        return Response({"error": "Event not found"}, status=404)

    if event.is_full:
        return Response({"error": "This event is fully booked"}, status=400)
    if not event.is_upcoming:
        return Response({"error": "This event has already passed"}, status=400)

    name = request.data.get("name", "").strip()
    email = request.data.get("email", "").strip()
    phone = request.data.get("phone", "").strip()
    spots = int(request.data.get("spots", 1))

    if not name:
        return Response({"error": "Name is required"}, status=400)
    if not email:
        return Response({"error": "Email is required"}, status=400)
    if spots < 1:
        return Response({"error": "At least 1 spot required"}, status=400)
    if spots > event.spots_left:
        return Response({"error": f"Only {event.spots_left} spot(s) available"}, status=400)

    Booking.objects.create(event=event, name=name, email=email, phone=phone, spots=spots)
    event.spots_taken += spots
    event.save()

    return Response({
        "message": "Booking confirmed!",
        "booking": {
            "event": event.title,
            "date": str(event.date),
            "start_time": str(event.start_time),
            "location": event.place.name if event.place else "TBA",
            "spots_booked": spots,
            "spots_remaining": event.spots_left,
            "price": str(event.price) if not event.is_free else "Free",
            "name": name,
            "email": email,
        }
    }, status=201)


# GET /api/creator/events/<id>/bookings/ — see who booked a specific event
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_event_bookings(request, event_id):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        event = Event.objects.get(id=event_id, creator=creator_profile)
    except Event.DoesNotExist:
        return Response({"error": "Event not found or not yours"}, status=404)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)

    bookings = Booking.objects.filter(event=event).order_by('-created_at')
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


# GET /api/creator/bookings/ — see all bookings across all of this creator's events
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_all_creator_bookings(request):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        bookings = Booking.objects.filter(
            event__creator=creator_profile
        ).select_related('event').order_by('-created_at')
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)