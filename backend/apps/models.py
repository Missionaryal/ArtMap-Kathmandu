# models.py
# This file defines all the database tables for ArtMap.
# Each class here becomes a table in PostgreSQL.

from django.db import models
from django.contrib.auth.models import User


# Every registered user gets a UserProfile automatically (see signals.py).
# This stores extra info that Django's built-in User model doesn't have.
class UserProfile(models.Model):
    # Link to Django's built-in User (one profile per user)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    bio = models.TextField(blank=True)
    # True if this user applied to be a creator (gallery, studio, etc.)
    is_creator = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


# CreatorProfile is only created for users who register as creators.
# An admin must approve them before they can add places or events.
class CreatorProfile(models.Model):
    CATEGORY_CHOICES = [
        ('gallery', 'Art Gallery'),
        ('museum', 'Museum'),
        ('thangka', 'Thangka Painting'),
        ('pottery', 'Pottery & Ceramics'),
        ('cafe', 'Art Café & Library'),
        ('workshop', 'Workshop'),
        ('studio', 'Artist Studio'),
        ('weaving', 'Weaving & Textile'),
        ('sculpture', 'Sculpture'),
        ('photography', 'Photography'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),    # Just applied, waiting for admin review
        ('approved', 'Approved'),  # Admin approved, can add places and events
        ('rejected', 'Rejected'),  # Admin rejected, account is disabled
    ]
    # Each creator profile belongs to exactly one user profile
    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE)
    business_name = models.CharField(max_length=200)
    business_description = models.TextField()
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    # verified becomes True when admin approves the creator
    verified = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.business_name


# A Place is a cultural location like a gallery, museum, or studio.
# Only approved creators can add places.
class Place(models.Model):
    CATEGORY_CHOICES = [
        ('gallery', 'Art Gallery'),
        ('museum', 'Museum'),
        ('thangka', 'Thangka Painting'),
        ('pottery', 'Pottery & Ceramics'),
        ('cafe', 'Art Café & Library'),
        ('workshop', 'Workshop'),
        ('studio', 'Artist Studio'),
        ('weaving', 'Weaving & Textile'),
        ('sculpture', 'Sculpture'),
        ('photography', 'Photography'),
    ]
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    location = models.CharField(max_length=255, blank=True)
    # If the creator is deleted, keep the place but set creator to null
    creator = models.ForeignKey(
        CreatorProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='places'
    )
    # Coordinates for showing the place on the map
    latitude = models.FloatField()
    longitude = models.FloatField()
    image = models.ImageField(upload_to='places/', null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    website = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    operating_hours = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Show newest places first by default
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    # Calculate the average star rating from all reviews for this place
    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews:
            return round(sum(r.rating for r in reviews) / len(reviews), 1)
        return 0

    # Total number of reviews this place has received
    @property
    def review_count(self):
        return self.reviews.count()


# A PlacePhoto stores extra photos uploaded by the creator for a place.
# The main place image is stored on the Place model itself.
class PlacePhoto(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='photos')
    photo = models.ImageField(upload_to='place_photos/')
    caption = models.CharField(max_length=255, blank=True)
    # Track who uploaded this photo (null if that user is deleted)
    uploaded_by = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Show oldest photos first (so the first upload appears first)
        ordering = ['created_at']

    def __str__(self):
        return f"{self.place.name} - Photo {self.id}"


# An Event is a workshop, class, exhibition, etc. hosted by a creator.
# Users can book spots — payment is done in person, not online.
class Event(models.Model):
    EVENT_TYPE_CHOICES = [
        ('workshop', 'Workshop'),
        ('class', 'Class'),
        ('tour', 'Guided Tour'),
        ('exhibition', 'Exhibition'),
        ('performance', 'Performance'),
        ('talk', 'Artist Talk'),
        ('retreat', 'Art Retreat'),
    ]
    # The creator who is hosting this event
    creator = models.ForeignKey(CreatorProfile, on_delete=models.CASCADE, related_name='events')
    # The place where the event is held (optional)
    place = models.ForeignKey(Place, on_delete=models.SET_NULL, null=True, blank=True, related_name='events')
    title = models.CharField(max_length=200)
    description = models.TextField()
    event_type = models.CharField(max_length=50, choices=EVENT_TYPE_CHOICES, default='workshop')
    image = models.ImageField(upload_to='events/', null=True, blank=True)
    date = models.DateField()
    start_time = models.TimeField()
    duration_hours = models.DecimalField(max_digits=4, decimal_places=1, default=2.0)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_free = models.BooleanField(default=False)
    total_spots = models.IntegerField(default=10)
    # How many spots have been booked so far
    spots_taken = models.IntegerField(default=0)
    is_published = models.BooleanField(default=True)
    is_cancelled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        # Show upcoming events first, sorted by date and time
        ordering = ['date', 'start_time']

    def __str__(self):
        return f"{self.title} — {self.date}"

    # How many spots are still available
    @property
    def spots_left(self):
        return max(0, self.total_spots - self.spots_taken)

    # True if no spots are left
    @property
    def is_full(self):
        return self.spots_left == 0

    # True if the event date is today or in the future
    @property
    def is_upcoming(self):
        from django.utils import timezone
        return self.date >= timezone.now().date()


# A Booking is created when someone reserves a spot at an event.
# No online payment — they pay at the venue.
class Booking(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='bookings')
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    # Number of spots this person is booking
    spots = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} — {self.event.title} ({self.spots} spot{'s' if self.spots > 1 else ''})"


# A Post is a photo that a user shares, tagged to a specific place.
# Think of it like an Instagram post tied to an ArtMap location.
class Post(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='posts')
    # The place this post is tagged at (optional)
    place = models.ForeignKey(Place, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    caption = models.TextField(blank=True)
    photo = models.ImageField(upload_to='posts/')
    # Private posts are only visible to the user who created them
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.user.username} - {self.place.name if self.place else 'No Place'}"


# A Review is a star rating + comment that a user leaves for a place.
# Each user can only review a place once (enforced by unique_together).
class Review(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='reviews')
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='reviews')
    # Rating from 1 to 5 stars
    rating = models.IntegerField(default=5, choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    # Optional photo attached to the review
    photo = models.ImageField(upload_to='reviews/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        # Prevent the same user from reviewing the same place twice
        unique_together = ['user', 'place']

    def __str__(self):
        return f"{self.user.user.username} - {self.place.name} ({self.rating}★)"


# A Bookmark is when a user saves a place to their favourites list.
# Each user can only bookmark a place once (enforced by unique_together).
class Bookmark(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='bookmarks')
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        # Prevent saving the same place twice
        unique_together = ['user', 'place']

    def __str__(self):
        return f"{self.user.user.username} - {self.place.name}"