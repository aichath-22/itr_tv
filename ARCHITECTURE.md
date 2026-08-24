# Architecture Django — Projet ITR TV

Basé sur le cahier des charges v1.0 (01/08/2026). Stack : **Django + Django REST Framework** (API) + **React** (front, séparé), **PostgreSQL**, **Cloudinary/S3** (médias), **Django Channels + Redis** (temps réel), **Celery** (tâches async).

---

## 1. Découpage en apps Django

Une app = un domaine métier, pour rester maintenable dans le temps.

| App | Responsabilité |
|---|---|
| `accounts` | Utilisateurs, rôles, authentification, profils |
| `articles` | Articles, catégories, tags, commentaires |
| `newsroom` | Workflow éditorial (brouillon → validation → publication) |
| `webtv` | Émissions, directs (live), bibliothèque vidéo |
| `ads` | Bannières publicitaires, campagnes, sponsoring |
| `newsletter` | Abonnés newsletter |
| `notifications` | Breaking news, notifications push, bandeau temps réel |
| `stats` | Agrégation des statistiques (vues, audience) |
| `core` | Éléments partagés (mixins, pagination, permissions custom) |

---

## 2. Système de rôles & permissions

### Approche recommandée : `AbstractUser` + champ `role`

Plus simple à raisonner qu'un système de Groups/Permissions pur, tout en restant compatible avec les permissions Django natives pour l'admin.

```python
# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    class Role(models.TextChoices):
        VISITEUR = "visiteur", "Visiteur"          # non authentifié (pas stocké réellement)
        ABONNE = "abonne", "Utilisateur inscrit"
        JOURNALISTE = "journaliste", "Journaliste"
        REDACTEUR_CHEF = "redacteur_chef", "Rédacteur en chef"
        ADMIN = "admin", "Administrateur"
        SUPER_ADMIN = "super_admin", "Super administrateur"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.ABONNE)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.URLField(blank=True)  # Cloudinary URL
    bio = models.TextField(blank=True)
    is_verified_journalist = models.BooleanField(default=False)

    @property
    def can_write_articles(self):
        return self.role in [self.Role.JOURNALISTE, self.Role.REDACTEUR_CHEF, self.Role.ADMIN, self.Role.SUPER_ADMIN]

    @property
    def can_validate_articles(self):
        return self.role in [self.Role.REDACTEUR_CHEF, self.Role.ADMIN, self.Role.SUPER_ADMIN]

    @property
    def can_manage_platform(self):
        return self.role in [self.Role.ADMIN, self.Role.SUPER_ADMIN]
```

### Matrice de permissions

| Action | Visiteur | Abonné | Journaliste | Rédac. chef | Admin | Super admin |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Lire articles/vidéos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Commenter | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| S'abonner newsletter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Rédiger un article (brouillon) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Soumettre à validation | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Valider/rejeter un article | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Gérer catégories/pub/users | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Config technique/sécurité/rôles | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

Implémentation côté DRF : classes `permissions.BasePermission` custom dans `core/permissions.py` (`IsJournalist`, `CanValidateArticle`, `IsAdminOrSuperAdmin`) + côté Django admin : `ModelAdmin.has_*_permission()` surchargées.

---

## 3. Modèles principaux par app

### `articles`

```python
class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

class Article(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Brouillon"
        PENDING = "pending", "En attente de validation"
        PUBLISHED = "published", "Publié"
        REJECTED = "rejected", "Rejeté"
        ARCHIVED = "archived", "Archivé"

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    excerpt = models.CharField(max_length=500, blank=True)
    content = models.TextField()  # ou RichTextField (ex. django-ckeditor)
    cover_image = models.URLField(blank=True)   # Cloudinary
    attached_pdf = models.URLField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="articles")
    tags = models.ManyToManyField(Tag, blank=True)
    author = models.ForeignKey("accounts.User", on_delete=models.PROTECT, related_name="articles")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    validated_by = models.ForeignKey("accounts.User", null=True, blank=True,
                                      on_delete=models.SET_NULL, related_name="validated_articles")
    published_at = models.DateTimeField(null=True, blank=True)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    related_articles = models.ManyToManyField("self", blank=True, symmetrical=False)

class Comment(models.Model):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    content = models.TextField()
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### `newsroom` (traçabilité du workflow éditorial)

```python
class ArticleReview(models.Model):
    class Action(models.TextChoices):
        SUBMITTED = "submitted", "Soumis"
        APPROVED = "approved", "Approuvé"
        REJECTED = "rejected", "Rejeté"
        REVISION_REQUESTED = "revision", "Révision demandée"

    article = models.ForeignKey("articles.Article", on_delete=models.CASCADE, related_name="reviews")
    actor = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=Action.choices)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

### `webtv`

```python
class Program(models.Model):  # Émission
    name = models.CharField(max_length=150)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    thumbnail = models.URLField(blank=True)
    presenter = models.CharField(max_length=150, blank=True)

class LiveStream(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Programmé"
        LIVE = "live", "En direct"
        ENDED = "ended", "Terminé"

    title = models.CharField(max_length=255)
    program = models.ForeignKey(Program, null=True, blank=True, on_delete=models.SET_NULL)
    description = models.TextField(blank=True)
    stream_url = models.URLField(blank=True)     # HLS (.m3u8) ou YouTube Live embed
    thumbnail = models.URLField(blank=True)
    scheduled_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    peak_viewers = models.PositiveIntegerField(default=0)

class Video(models.Model):  # rediffusions / bibliothèque
    title = models.CharField(max_length=255)
    program = models.ForeignKey(Program, null=True, blank=True, on_delete=models.SET_NULL)
    category = models.ForeignKey("articles.Category", null=True, blank=True, on_delete=models.SET_NULL)
    video_url = models.URLField()   # YouTube ou fichier hébergé
    thumbnail = models.URLField(blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    views_count = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(auto_now_add=True)
    source_live = models.ForeignKey(LiveStream, null=True, blank=True, on_delete=models.SET_NULL)
```

### `ads`

```python
class Sponsor(models.Model):
    name = models.CharField(max_length=150)
    logo = models.URLField(blank=True)

class AdBanner(models.Model):
    class Placement(models.TextChoices):
        HOME_TOP = "home_top", "Accueil - Haut"
        HOME_SIDEBAR = "home_sidebar", "Accueil - Latéral"
        ARTICLE_INLINE = "article_inline", "Article - Intégré"
        WEBTV_PRE_ROLL = "webtv_preroll", "Web TV - Pré-roll"

    sponsor = models.ForeignKey(Sponsor, on_delete=models.CASCADE)
    placement = models.CharField(max_length=30, choices=Placement.choices)
    image = models.URLField()
    target_url = models.URLField()
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    clicks_count = models.PositiveIntegerField(default=0)
    impressions_count = models.PositiveIntegerField(default=0)
```

### `newsletter` / `notifications`

```python
# newsletter/models.py
class Subscriber(models.Model):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

# notifications/models.py
class BreakingNews(models.Model):
    title = models.CharField(max_length=255)
    link = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

---

## 4. Structure API (DRF) — vue d'ensemble

```
/api/v1/
├── auth/                     (JWT: login, refresh, register)
├── articles/                 GET (public), POST (journaliste+)
├── articles/{slug}/
├── articles/{slug}/comments/
├── articles/{id}/submit/     POST — soumettre à validation
├── articles/{id}/review/     POST — valider/rejeter (rédac. chef+)
├── categories/
├── webtv/live/                GET — directs en cours/à venir
├── webtv/videos/
├── programs/
├── ads/banners/               GET (filtré par placement)
├── newsletter/subscribe/     POST
├── notifications/breaking/   GET
├── stats/dashboard/          GET (admin only)
```

---

## 5. Structure de dossiers projet

```
itr_tv_backend/
├── config/                   # settings Django (base.py, dev.py, prod.py)
│   ├── settings/
│   ├── urls.py
│   ├── asgi.py                # pour Channels
│   └── wsgi.py
├── apps/
│   ├── accounts/
│   ├── articles/
│   ├── newsroom/
│   ├── webtv/
│   ├── ads/
│   ├── newsletter/
│   ├── notifications/
│   ├── stats/
│   └── core/
├── requirements/
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
├── Dockerfile
├── docker-compose.yml
├── manage.py
└── .env.example
```

---

## 6. Stack technique détaillée

| Composant | Choix |
|---|---|
| Framework | Django 5.x + Django REST Framework |
| Auth API | `djangorestframework-simplejwt` (JWT) |
| Base de données | PostgreSQL |
| Médias | `django-cloudinary-storage` (ou boto3/S3) |
| Temps réel (breaking news, live status) | Django Channels + Redis |
| Tâches async (republication planifiée, emails) | Celery + Redis |
| Éditeur riche articles | `django-ckeditor` ou intégration front (React) |
| Recherche | PostgreSQL full-text search (`SearchVector`) au départ, Elasticsearch si besoin plus tard |
| Streaming live | Nginx-RTMP / YouTube Live embed (Django gère seulement métadonnées et statut) |
| Déploiement | Docker + Nginx + Gunicorn/Uvicorn (ASGI pour Channels) |
| CI/CD | GitHub Actions |

---

## 7. Prochaines étapes suggérées

1. Initialiser le repo (`django-admin startproject config .`), config settings par environnement.
2. Créer `accounts` avec le `User` custom **en tout premier** (`AUTH_USER_MODEL`) — impossible à changer proprement après coup.
3. Créer `core` (permissions, pagination, mixins communs).
4. Développer `articles` + `newsroom` (cœur du portail d'info).
5. Développer `webtv` (live + bibliothèque).
6. Brancher `ads`, `newsletter`, `notifications`, `stats`.
7. Dockeriser + CI dès que le squelette tourne, pas à la fin.
