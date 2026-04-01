from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

from rest_framework import viewsets, generics, permissions, status, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAuthenticatedOrReadOnly

from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import Place, Post, Review, Bookmark, UserProfile, PlacePhoto, CreatorProfile
from .serializers import (
    PlaceSerializer,
    PostSerializer,
    ReviewSerializer,
    BookmarkSerializer,
    RegisterSerializer,
    PlacePhotoSerializer,
    CreatorProfileSerializer,
)
from .permissions import IsApprovedCreatorOrReadOnly


# ─── Auth ─────────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
            "message": "Account created successfully"
        }, status=status.HTTP_201_CREATED)


# ─── Places ───────────────────────────────────────────────────────────────────

class PlaceViewSet(viewsets.ModelViewSet):
    serializer_class = PlaceSerializer
    permission_classes = [IsApprovedCreatorOrReadOnly]

    def get_queryset(self):
        if self.request.query_params.get('my_places') == 'true':
            if self.request.user.is_authenticated:
                try:
                    creator_profile = self.request.user.userprofile.creatorprofile
                    return Place.objects.filter(
                        creator=creator_profile
                    ).prefetch_related('photos', 'posts', 'reviews')
                except Exception:
                    return Place.objects.none()
        return Place.objects.all().prefetch_related('photos', 'posts', 'reviews')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        creator_profile = self.request.user.userprofile.creatorprofile
        serializer.save(creator=creator_profile)


# ─── Posts ────────────────────────────────────────────────────────────────────

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Get current user's own posts
        if self.request.query_params.get('my_posts') == 'true':
            if self.request.user.is_authenticated:
                try:
                    user_profile = self.request.user.userprofile
                    return Post.objects.filter(user=user_profile)
                except Exception:
                    return Post.objects.none()

        # Get posts for creator's places
        if self.request.query_params.get('my_places') == 'true':
            if self.request.user.is_authenticated:
                try:
                    creator_profile = self.request.user.userprofile.creatorprofile
                    return Post.objects.filter(place__creator=creator_profile)
                except Exception:
                    return Post.objects.none()

        # Default: only public posts
        return Post.objects.filter(is_public=True)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def perform_create(self, serializer):
        user_profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        serializer.save(user=user_profile)

    def get_permissions(self):
        # Allow read for anyone, but write only for authenticated users
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated()]
        return [IsAuthenticatedOrReadOnly()]


#  Reviews 
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


#  Bookmarks 

class BookmarkViewSet(viewsets.ModelViewSet):
    queryset = Bookmark.objects.all()
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        user_profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        serializer.save(user=user_profile)


#  Place Reviews (public GET, auth POST) 

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

    if not request.user.is_authenticated:
        return Response({"error": "Login required"}, status=401)

    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if Review.objects.filter(user=user_profile, place=place).exists():
        return Response({"error": "You have already reviewed this place"}, status=400)

    serializer = ReviewSerializer(data=request.data, context={"request": request})
    if serializer.is_valid():
        serializer.save(user=user_profile, place=place)
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)


#  Review Edit/Delete 
@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def review_detail(request, review_id):
    try:
        review = Review.objects.get(id=review_id)
    except Review.DoesNotExist:
        return Response({"error": "Review not found"}, status=404)

    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)

    if review.user != user_profile:
        return Response({"error": "Not allowed"}, status=403)

    if request.method == "PUT":
        serializer = ReviewSerializer(
            review, data=request.data, partial=True,
            context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    review.delete()
    return Response({"message": "Deleted"}, status=204)


#  User Info 
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    user = request.user
    user_info = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
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


#  Creator Stats 
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
            "status": creator_profile.status,
            "verified": creator_profile.verified,
        })
    except Exception as e:
        return Response({"error": str(e)}, status=400)


#  Creator Profile ViewSet 

class CreatorProfileViewSet(viewsets.ModelViewSet):
    serializer_class = CreatorProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        try:
            return CreatorProfile.objects.filter(
                user_profile=self.request.user.userprofile
            )
        except Exception:
            return CreatorProfile.objects.none()

    def perform_create(self, serializer):
        serializer.save(user_profile=self.request.user.userprofile)


#  Password Reset 

@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get("email")
    if not email:
        return Response({"error": "Email required"}, status=400)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "If an account exists, a reset link will be sent."})

    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    reset_link = f"http://localhost:5173/reset-password/{uid}/{token}"

    return Response({"message": "Reset link generated", "reset_link": reset_link})


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
        return Response({"error": "Reset link has expired"}, status=400)

    user.set_password(password)
    user.save()
    return Response({"message": "Password reset successful"})


#  Bookmarks 

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


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def check_bookmark(request, place_id):
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    exists = Bookmark.objects.filter(user=user_profile, place_id=place_id).exists()
    return Response({"bookmarked": exists})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_user_bookmarks(request):
    user_profile, _ = UserProfile.objects.get_or_create(user=request.user)
    bookmarks = Bookmark.objects.filter(user=user_profile).select_related('place')
    places = [b.place for b in bookmarks]
    serializer = PlaceSerializer(places, many=True, context={"request": request})
    return Response(serializer.data)


#  Email Login 
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
            users = User.objects.filter(email=email)
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
                        raise AuthenticationFailed(
                            "Your creator application was not approved. Contact support@artmap.com"
                        )
                    raise AuthenticationFailed(
                        "Your creator account is under review. This usually takes 24-48 hours."
                    )
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
                    raise AuthenticationFailed(
                        "Your creator account is under review. This usually takes 24-48 hours."
                    )
                elif creator_profile.status == "rejected":
                    raise AuthenticationFailed(
                        "Your creator application was not approved. Contact support@artmap.com"
                    )
        except AuthenticationFailed:
            raise
        except Exception:
            pass

        refresh = self.get_token(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


class EmailAuthTokenView(TokenObtainPairView):
    serializer_class = EmailAuthTokenSerializer


#  Place Posts & Photos (public) 

@api_view(["GET"])
def place_posts(request, place_id):
    try:
        place = Place.objects.get(id=place_id)
    except Place.DoesNotExist:
        return Response({"error": "Place not found"}, status=404)

    posts = Post.objects.filter(place=place, is_public=True)
    serializer = PostSerializer(posts, many=True, context={"request": request})
    return Response(serializer.data)


@api_view(["GET"])
def place_photos(request, place_id):
    try:
        place = Place.objects.get(id=place_id)
    except Place.DoesNotExist:
        return Response({"error": "Place not found"}, status=404)

    photos = PlacePhoto.objects.filter(place=place)
    serializer = PlacePhotoSerializer(photos, many=True, context={"request": request})
    return Response(serializer.data)


#  Creator Profile 

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

        serializer = CreatorProfileSerializer(
            creator_profile, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    except AttributeError:
        return Response({"error": "Creator profile not found"}, status=404)


#  Creator Places 
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_creator_place(request):
    try:
        creator_profile = request.user.userprofile.creatorprofile

        if creator_profile.status != 'approved':
            return Response(
                {"error": "Only approved creators can create places"}, status=403
            )

        serializer = PlaceSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save(creator=creator_profile)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    except AttributeError:
        return Response({"error": "Creator profile not found"}, status=404)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_creator_place(request, place_id):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        place = Place.objects.get(id=place_id, creator=creator_profile)

        serializer = PlaceSerializer(
            place, data=request.data, partial=True,
            context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    except Place.DoesNotExist:
        return Response({"error": "Place not found or not yours"}, status=404)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)


#  Place Photos 

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_place_photo(request, place_id):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        place = Place.objects.get(id=place_id, creator=creator_profile)

        serializer = PlacePhotoSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save(place=place, uploaded_by=request.user.userprofile)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    except Place.DoesNotExist:
        return Response({"error": "Place not found or not yours"}, status=404)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)


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


#  Creator Tagged Posts & Reviews 
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_creator_tagged_posts(request):
    try:
        creator_profile = request.user.userprofile.creatorprofile
        posts = Post.objects.filter(
            place__creator=creator_profile, is_public=True
        )
        serializer = PostSerializer(posts, many=True, context={"request": request})
        return Response(serializer.data)
    except AttributeError:
        return Response({"error": "Not a creator"}, status=403)


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