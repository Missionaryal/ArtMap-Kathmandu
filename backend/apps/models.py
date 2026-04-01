from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    bio = models.TextField(blank=True)
    is_creator = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username


class CreatorProfile(models.Model):
    CATEGORY_CHOICES = [
        ('gallery', 'Art Gallery'),
        ('museum', 'Museum'),
        ('studio', 'Artist Studio'),
        ('workshop', 'Workshop'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE)
    business_name = models.CharField(max_length=200)
    business_description = models.TextField()
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    verified = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.business_name


class Place(models.Model):
    CATEGORY_CHOICES = [
        ('gallery', 'Art Gallery'),
        ('museum', 'Museum'),
        ('studio', 'Artist Studio'),
        ('workshop', 'Workshop'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    location = models.CharField(max_length=255, blank=True)
    creator = models.ForeignKey(
        CreatorProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='places'
    )
    latitude = models.FloatField()
    longitude = models.FloatField()
    image = models.ImageField(upload_to='places/', null=True, blank=True)

    # Contact & Info fields
    phone = models.CharField(max_length=20, blank=True)
    website = models.CharField(max_length=255, blank=True)
    email = models.EmailField(blank=True)
    operating_hours = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name

    @property
    def average_rating(self):
        reviews = self.reviews.all()
        if reviews:
            return round(sum(r.rating for r in reviews) / len(reviews), 1)
        return 0

    @property
    def review_count(self):
        return self.reviews.count()


class PlacePhoto(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='photos')
    photo = models.ImageField(upload_to='place_photos/')
    caption = models.CharField(max_length=255, blank=True)
    uploaded_by = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']  # oldest first → first uploaded = cover photo

    def __str__(self):
        return f"{self.place.name} - Photo {self.id}"


class Post(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='posts')
    place = models.ForeignKey(Place, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    caption = models.TextField(blank=True)
    photo = models.ImageField(upload_to='posts/')
    is_public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.user.username} - {self.place.name if self.place else 'No Place'}"


class Review(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='reviews')
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='reviews')
    rating = models.IntegerField(default=5, choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    photo = models.ImageField(upload_to='reviews/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'place']

    def __str__(self):
        return f"{self.user.user.username} - {self.place.name} ({self.rating}★)"


class Bookmark(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='bookmarks')
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name='bookmarks')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'place']

    def __str__(self):
        return f"{self.user.user.username} - {self.place.name}"