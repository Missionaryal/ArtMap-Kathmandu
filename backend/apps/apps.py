# apps.py
# This is the app configuration file for the 'apps' Django application.
# It tells Django how to set up this app when the server starts.

from django.contrib import admin
from django.apps import AppConfig


class AppsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps'

    def ready(self):
        # Import signals so Django registers them when the app starts.
        # Signals automatically create a UserProfile whenever a new User is created.
        # Without this import, the signal would never be connected and UserProfiles
        # would not be created automatically.
        from . import signals