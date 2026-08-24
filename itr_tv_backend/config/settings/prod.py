import os
from .base import *  # noqa

DEBUG = False
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "itrtv.bj,www.itrtv.bj").split(",")

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST", "db"),
        "PORT": os.getenv("DB_PORT", "5432"),
    }
}

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"

# --- Stockage médias sur Cloudinary (recommandé par le cahier des charges) ---
# pip install django-cloudinary-storage puis décommenter :
# INSTALLED_APPS += ["cloudinary_storage", "cloudinary"]
# DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"
# CLOUDINARY_STORAGE = {
#     "CLOUD_NAME": os.getenv("CLOUDINARY_CLOUD_NAME"),
#     "API_KEY": os.getenv("CLOUDINARY_API_KEY"),
#     "API_SECRET": os.getenv("CLOUDINARY_API_SECRET"),
# }
