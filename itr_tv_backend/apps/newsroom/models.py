from django.conf import settings
from django.db import models


class ArticleReview(models.Model):
    """Historique du circuit de validation d'un article (cahier des charges §4.3)."""

    class Action(models.TextChoices):
        SUBMITTED = "submitted", "Soumis"
        APPROVED = "approved", "Approuvé"
        REJECTED = "rejected", "Rejeté"
        REVISION_REQUESTED = "revision", "Révision demandée"

    article = models.ForeignKey("articles.Article", on_delete=models.CASCADE, related_name="reviews")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    action = models.CharField(max_length=20, choices=Action.choices)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.article} — {self.get_action_display()}"
