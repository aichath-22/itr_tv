from django.db import models
from apps.core.models import TimeStampedModel


class Sponsor(models.Model):
    name = models.CharField(max_length=150)
    logo = models.URLField(blank=True)

    def __str__(self):
        return self.name


class AdBanner(TimeStampedModel):
    class Placement(models.TextChoices):
        HOME_TOP = "home_top", "Accueil - Haut"
        HOME_SIDEBAR = "home_sidebar", "Accueil - Latéral"
        ARTICLE_INLINE = "article_inline", "Article - Intégré"
        WEBTV_PREROLL = "webtv_preroll", "Web TV - Pré-roll"

    sponsor = models.ForeignKey(Sponsor, on_delete=models.CASCADE, related_name="banners")
    placement = models.CharField(max_length=30, choices=Placement.choices)
    image = models.URLField()
    target_url = models.URLField()
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    clicks_count = models.PositiveIntegerField(default=0)
    impressions_count = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.sponsor} ({self.get_placement_display()})"
