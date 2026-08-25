from django.conf import settings
from django.db import models
from apps.core.models import TimeStampedModel


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Article(TimeStampedModel):
    class Status(models.TextChoices):
        DRAFT = "draft", "Brouillon"
        PENDING = "pending", "En attente de validation"
        PUBLISHED = "published", "Publié"
        REJECTED = "rejected", "Rejeté"
        ARCHIVED = "archived", "Archivé"

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    excerpt = models.CharField(max_length=500, blank=True)
    content = models.TextField()
    cover_image = models.URLField(blank=True)
    attached_pdf = models.URLField(blank=True)

    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="articles")
    tags = models.ManyToManyField(Tag, blank=True, related_name="articles")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="articles")

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    validated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="validated_articles",
    )
    published_at = models.DateTimeField(null=True, blank=True)
    views_count = models.PositiveIntegerField(default=0)
    related_articles = models.ManyToManyField("self", blank=True, symmetrical=False)
    liked_by = models.ManyToManyField(
        settings.AUTH_USER_MODEL, related_name="liked_articles", blank=True,
    )

    class Meta:
        ordering = ["-published_at", "-created_at"]

    def __str__(self):
        return self.title


class Comment(TimeStampedModel):
    article = models.ForeignKey(Article, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    is_approved = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Commentaire de {self.author} sur {self.article}"
