# artmap/urls.py
# This is the main URL configuration for the entire Django project.
# It connects the top-level URL paths to the right parts of the app.

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from apps.views import EmailAuthTokenView

urlpatterns = [
    # Admin panel — the URL is read from settings.ADMIN_URL (set in .env)
    # Using a secret URL instead of /admin/ makes it harder for attackers to find
    path(f'{settings.ADMIN_URL}/', admin.site.urls),

    # All API endpoints are handled in apps/urls.py
    path('api/', include('apps.urls')),

    # JWT login — POST email + password, get back access and refresh tokens
    path('api/token/', EmailAuthTokenView.as_view(), name='token_obtain_pair'),

    # JWT token refresh — POST a refresh token, get back a new access token
    # Used automatically by the frontend when the access token expires
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# In development, Django serves uploaded media files (images) directly.
# In production, a web server like Nginx handles this instead.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)