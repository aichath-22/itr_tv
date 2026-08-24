from django.db import models
from apps.core.models import TimeStampedModel


class Program(TimeStampedModel):
    """Émission."""

    name = models.CharField(max_length=150)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    thumbnail = models.URLField(blank=True)
    presenter = models.CharField(max_length=150, blank=True)

    def __str__(self):
        return self.name


class LiveStream(TimeStampedModel):
    class Status(models.TextChoices):
        SCHEDULED = "scheduled", "Programmé"
        LIVE = "live", "En direct"
        ENDED = "ended", "Terminé"

    title = models.CharField(max_length=255)
    program = models.ForeignKey(Program, null=True, blank=True, on_delete=models.SET_NULL, related_name="live_streams")
    description = models.TextField(blank=True)
    stream_url = models.URLField(blank=True, help_text="URL HLS (.m3u8) ou lien YouTube Live")
    thumbnail = models.URLField(blank=True)
    scheduled_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    peak_viewers = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-scheduled_at"]

    def __str__(self):
        return self.title


class Video(TimeStampedModel):
    """Rediffusion / bibliothèque vidéo."""

    title = models.CharField(max_length=255)
    program = models.ForeignKey(Program, null=True, blank=True, on_delete=models.SET_NULL, related_name="videos")
    category = models.ForeignKey("articles.Category", null=True, blank=True, on_delete=models.SET_NULL, related_name="videos")
    video_url = models.URLField(help_text="URL YouTube ou fichier hébergé")
    thumbnail = models.URLField(blank=True)
    duration_seconds = models.PositiveIntegerField(default=0)
    views_count = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(auto_now_add=True)
    source_live = models.ForeignKey(LiveStream, null=True, blank=True, on_delete=models.SET_NULL, related_name="replays")

    class Meta:
        ordering = ["-published_at"]

    def __str__(self):
        return self.title
