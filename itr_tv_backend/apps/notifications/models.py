from django.db import models


class BreakingNews(models.Model):
    """Bandeau d'information temps réel / alerte breaking news (cahier des charges §4.5)."""

    title = models.CharField(max_length=255)
    link = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name_plural = "breaking news"

    def __str__(self):
        return self.title
