import os
from django.core.exceptions import ImproperlyConfigured
from .base import *  # noqa

DEBUG = False
ALLOWED_HOSTS = os.getenv("DJANGO_ALLOWED_HOSTS", "itrtv.bj,www.itrtv.bj").split(",")

if not os.getenv("DJANGO_SECRET_KEY"):
    raise ImproperlyConfigured(
        "DJANGO_SECRET_KEY doit être défini en production (variable d'environnement "
        "absente ou .env non monté) — refus de démarrer avec la clé de secours de dev."
    )

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.mysql",
        "NAME": os.getenv("DB_NAME"),
        "USER": os.getenv("DB_USER"),
        "PASSWORD": os.getenv("DB_PASSWORD"),
        "HOST": os.getenv("DB_HOST", "db"),
        "PORT": os.getenv("DB_PORT", "3306"),
        "OPTIONS": {"charset": "utf8mb4"},
    }
}

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"
