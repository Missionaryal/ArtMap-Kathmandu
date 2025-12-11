from django.contrib import admin

from .models import UserProfile, CreatorProfile, Place, Post, Review, Bookmark
admin.site.register(UserProfile)
admin.site.register(CreatorProfile)
admin.site.register(Place)
admin.site.register(Post)
admin.site.register(Review)
admin.site.register(Bookmark)
