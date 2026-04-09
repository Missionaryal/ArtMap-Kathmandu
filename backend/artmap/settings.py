# settings.py
# Main configuration file for the ArtMap Django backend.
# All sensitive values (passwords, keys) are loaded from the .env file
# so they are never hardcoded in the source code.

from pathlib import Path
from django.templatetags.static import static
from django.urls import reverse_lazy
# Using 'gettext' instead of the usual '_' alias to avoid a conflict with
# the .env file loader which also uses '_' as a variable name
from django.utils.translation import gettext_lazy as gettext
import os

# BASE_DIR points to the backend/ folder
BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from backend/.env
# This keeps secrets like database passwords and API keys out of the code
env_file = BASE_DIR / ".env"
if env_file.exists():
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            # Skip blank lines and comments
            if line and not line.startswith("#") and "=" in line:
                key, _, value = line.partition("=")
                key = key.strip()
                value = value.strip()
                # Skip '_' because it is a shell built-in and would overwrite
                # the gettext function if accidentally set in the .env file
                if key and key != "_":
                    os.environ.setdefault(key, value)

# Secret key used for cryptographic signing — must be kept private in production
SECRET_KEY = os.environ.get(
    "SECRET_KEY",
    "django-insecure-x6tjr=ihj%$59y4f^6cn(r=rzr^^(%ljwf!p$qclrddfmtxqyv"
)

# DEBUG=True shows detailed error pages — must be False in production
DEBUG = os.environ.get("DEBUG", "True") == "True"

# Only allow requests from these hosts — prevents HTTP Host header attacks
ALLOWED_HOSTS = os.environ.get("ALLOWED_HOSTS", "127.0.0.1,localhost").split(",")

INSTALLED_APPS = [
    # Unfold is the custom admin theme that gives the admin panel its styled look
    "unfold",
    "unfold.contrib.filters",
    "unfold.contrib.forms",
    "unfold.contrib.import_export",
    "unfold.contrib.guardian",
    "unfold.contrib.simple_history",
    # Django's built-in apps
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Our main application
    "apps.apps.AppsConfig",
    # Django REST Framework — handles the API
    "rest_framework",
    # Allows the React frontend to call the Django API from a different port
    "corsheaders",
]

MIDDLEWARE = [
    # CORS must come first so it can add the right headers before other middleware runs
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "artmap.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        # Look for HTML templates in the apps/templates folder
        "DIRS": [BASE_DIR / "apps" / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "artmap.wsgi.application"

# Database — PostgreSQL running locally
# All values come from the .env file so credentials are never in the code
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "artmap_db"),
        "USER": os.environ.get("DB_USER", "artmap_user"),
        "PASSWORD": os.environ.get("DB_PASSWORD", "artmap123"),
        "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": os.environ.get("DB_PORT", "5432"),
    }
}

# Password rules — enforced when users set or change passwords
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
# Nepal Standard Time
TIME_ZONE = "Asia/Kathmandu"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JS, admin assets)
STATIC_URL = "/static/"
STATICFILES_DIRS = [BASE_DIR / "apps" / "static"]
# Where collectstatic copies files to for production
STATIC_ROOT = BASE_DIR / "staticfiles"

# Media files (uploaded images — profile photos, place images, review photos, etc.)
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# API configuration — use JWT tokens for authentication
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    # By default, anyone can read but only logged-in users can write
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ),
}

# Allow the React frontend (running on port 5173) to call the Django API (port 8000)
# Without this, browsers would block the requests due to CORS policy
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
CORS_ALLOW_CREDENTIALS = True

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# Allow the admin panel to be embedded in an iframe on the same domain
X_FRAME_OPTIONS = "SAMEORIGIN"
SILENCED_SYSTEM_CHECKS = ["security.W019"]

# Email — Gmail SMTP for sending password reset emails
# Credentials are loaded from .env — never hardcoded here
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = "smtp.gmail.com"
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = f"ArtMap Kathmandu <{os.environ.get('EMAIL_HOST_USER', 'noreply@artmap.com')}>"

# The frontend URL is used when building the password reset link in emails
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

# The admin panel URL — kept secret so it is not easy to guess
# Default is 'artmap-admin-2026' but should be changed in production via .env
ADMIN_URL = os.environ.get("ADMIN_URL", "artmap-admin-2026")


# Provides live stats for the admin dashboard overview page
def dashboard_callback(request, context):
    from django.contrib.auth.models import User
    from apps.models import Place, CreatorProfile, Booking
    context.update({
        "total_users": User.objects.count(),
        "total_places": Place.objects.count(),
        "pending_count": CreatorProfile.objects.filter(status="pending").count(),
        "total_bookings": Booking.objects.count(),
        # Show the 5 most recent pending creators for quick review
        "pending_creators": CreatorProfile.objects.filter(
            status="pending"
        ).select_related("user_profile__user").order_by("-created_at")[:5],
        "recent_places": Place.objects.order_by("-created_at")[:5],
    })
    return context


# Shows a number badge on the Verification sidebar item when creators are waiting for approval
def badge_callback(request):
    from apps.models import CreatorProfile
    count = CreatorProfile.objects.filter(status="pending").count()
    return str(count) if count > 0 else None


# Unfold admin theme configuration — controls the look and layout of the admin panel
UNFOLD = {
    "SITE_TITLE": "ArtMap",
    "SITE_HEADER": "ArtMap Admin",
    # Clicking the logo in the admin goes to the main site
    "SITE_URL": "/",
    # Use the ArtMap logo in the admin panel header
    "SITE_ICON": {
        "light": lambda request: static("artmap final logo.jpeg"),
        "dark": lambda request: static("artmap final logo.jpeg"),
    },
    "SITE_LOGO": {
        "light": lambda request: static("artmap final logo.jpeg"),
        "dark": lambda request: static("artmap final logo.jpeg"),
    },
    "SHOW_HISTORY": False,
    "SHOW_VIEW_ON_SITE": False,
    "DASHBOARD_CALLBACK": "artmap.settings.dashboard_callback",
    # Gold/amber colour palette to match the ArtMap brand
    "COLORS": {
        "primary": {
            "50":  "254 248 236",
            "100": "253 239 200",
            "200": "251 224 140",
            "300": "249 206 80",
            "400": "247 189 40",
            "500": "201 169 97",
            "600": "176 141 79",
            "700": "139 109 61",
            "800": "107 83 47",
            "900": "82 63 36",
            "950": "47 35 21",
        },
    },
    # Custom sidebar navigation — only show the sections we need
    "SIDEBAR": {
        "show_search": False,
        "show_all_applications": False,
        "navigation": [
            {
                "items": [
                    {
                        "title": gettext("Overview"),
                        "icon": "dashboard",
                        "link": reverse_lazy("admin:index"),
                    },
                    {
                        "title": gettext("Users"),
                        "icon": "people",
                        "link": reverse_lazy("admin:apps_userprofile_changelist"),
                    },
                    {
                        "title": gettext("Places"),
                        "icon": "location_on",
                        "link": reverse_lazy("admin:apps_place_changelist"),
                    },
                    {
                        # Shows a badge with the number of pending creator applications
                        "title": gettext("Verification"),
                        "icon": "verified_user",
                        "link": reverse_lazy("admin:apps_creatorprofile_changelist"),
                        "badge": "artmap.settings.badge_callback",
                    },
                    {
                        "title": gettext("Events"),
                        "icon": "event",
                        "link": reverse_lazy("admin:apps_event_changelist"),
                    },
                    {
                        "title": gettext("Posts"),
                        "icon": "photo_library",
                        "link": reverse_lazy("admin:apps_post_changelist"),
                    },
                    {
                        "title": gettext("Reviews"),
                        "icon": "star",
                        "link": reverse_lazy("admin:apps_review_changelist"),
                    },
                    {
                        "title": gettext("Bookings"),
                        "icon": "book_online",
                        "link": reverse_lazy("admin:apps_booking_changelist"),
                    },
                ],
            },
        ],
    },
}