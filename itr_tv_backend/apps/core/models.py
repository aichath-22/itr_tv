from django.db import models


class TimeStampedModel(models.Model):
    """Mixin abstrait : created_at / updated_at pour tous les modèles qui en ont besoin."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
