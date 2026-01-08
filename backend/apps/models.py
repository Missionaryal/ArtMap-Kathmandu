from django.db import models
from  django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    profile_picture = models.ImageField(upload_to='profiles/', null=True,blank=True)
    bio = models.TextField(blank=True)
    is_creator = models.BooleanField(default=False)

def __str__(self):
        return self.user.username

class CreatorProfile(models.Model):
      user_profile = models.OneToOneField(UserProfile, on_delete=models.CASCADE)
      business_name = models.CharField(max_length=200)
      business_description = models.TextField()
      category = models.CharField(max_length=100)
      verified = models.BooleanField(default=False)
def __str__(self):
      return self.business_name
    
class Place(models.Model):
      name = models.CharField(max_length=200)
      description = models.TextField(blank=True)
      category = models.CharField(max_length=100) #gallery, studio
      creator = models.ForeignKey(CreatorProfile, on_delete=models.SET_NULL, null=True, blank=True)
      latitude = models.FloatField()
      longitude = models.FloatField()
      created_at = models.DateTimeField(auto_now_add=True)
def __str__(self):
        return self.name

class Post(models.Model):
      user= models.ForeignKey(UserProfile, on_delete=models.CASCADE) #who posted
      place= models.ForeignKey(Place, on_delete=models.SET_NULL, null=True) #tagged place
      caption = models.TextField(blank=True)
      photo = models.ImageField(upload_to='posts/', null=True, blank=True) #optional photo
      is_public = models.BooleanField(default=True) #public or private
      created_at = models.DateTimeField(auto_now_add=True)
def __str__(self):
        return f"{self.user.user.username} - {self.place.name if self.place else 'No Place'}"


class Review(models.Model):
       user = models.ForeignKey(UserProfile, on_delete=models.CASCADE) #who worte the review
       place = models.ForeignKey(Place, on_delete=models.CASCADE) #which place is reviewed
       rating = models.IntegerField(default=0)
       comment = models.TextField(blank=True) #optional review text
       created_at = models.DateTimeField(auto_now_add=True) #when review was created
def __str__(self):
       return f"{self.user.user.username} - {self.place.name} ({self.rating})"


class Bookmark(models.Model):
       user = models.ForeignKey(UserProfile, on_delete=models.CASCADE) #who bookmarked
       place = models.ForeignKey(Place, on_delete=models.CASCADE, null=True, blank=True) #optional bookmark a place
       post = models.ForeignKey('Post', on_delete=models.CASCADE, null=True, blank=True) #optional bookmark a post
       created_at = models.DateTimeField(auto_now_add=True)
def __str__(self):
       if self.place:
              return f"{self.user.user.username} - {self.place.name} (Place)"
       elif self.post:
              return f"{self.user.user.username} - Post ID {self.post.id}"
       return f"{self.user.user.username} - Bookmark"