from django.contrib import admin
from django.apps import AppConfig


class AppsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps'
    
    def ready(self):
        # Import admin customizations
        from . import admin as apps_admin
        # Import signals (source of truth for UserProfile creation)
        from . import signals