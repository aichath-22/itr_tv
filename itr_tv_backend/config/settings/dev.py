from .base import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ["*"]

# En dev : SQLite par défaut (voir base.py). Décommente pour utiliser PostgreSQL en local :
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.postgresql",
#         "NAME": os.getenv("DB_NAME", "itr_tv_dev"),
#         "USER": os.getenv("DB_USER", "postgres"),
#         "PASSWORD": os.getenv("DB_PASSWORD", "postgres"),
#         "HOST": os.getenv("DB_HOST", "localhost"),
#         "PORT": os.getenv("DB_PORT", "5432"),
#     }
# }
