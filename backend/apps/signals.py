# signals.py
# Django signals let you automatically run code when something happens in the database.
# Here we use a signal to create a UserProfile every time a new User is registered.
# This means we never have to manually create UserProfiles — it happens automatically.

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User
from .models import UserProfile


# This function runs automatically after a new User is saved to the database.
# 'created' is True only when a new user is being created (not on updates).
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # Create a blank UserProfile linked to the new user
        UserProfile.objects.create(user=instance)