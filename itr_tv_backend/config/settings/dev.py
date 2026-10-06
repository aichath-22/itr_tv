from .base import *  # noqa

DEBUG = True
ALLOWED_HOSTS = ["*"]

# En dev : SQLite par défaut (voir base.py). Décommente pour utiliser MySQL en local :
# DATABASES = {
#     "default": {
#         "ENGINE": "django.db.backends.mysql",
#         "NAME": os.getenv("DB_NAME", "itr_tv_dev"),
#         "USER": os.getenv("DB_USER", "root"),
#         "PASSWORD": os.getenv("DB_PASSWORD", "root"),
#         "HOST": os.getenv("DB_HOST", "localhost"),
#         "PORT": os.getenv("DB_PORT", "3306"),
#         "OPTIONS": {"charset": "utf8mb4"},
#     }
# }
