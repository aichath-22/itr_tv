from django.db import models


class TimeStampedModel(models.Model):
    """Mixin abstrait : created_at / updated_at pour tous les modèles qui en ont besoin."""

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SiteSettings(models.Model):
    """Informations du site modifiables par l'admin (contact, footer, réseaux sociaux).
    Toujours une seule ligne en base (singleton), chargée via SiteSettings.load()."""

    contact_email = models.EmailField(blank=True, default="contact@itrtv.bj")
    contact_phone = models.CharField(max_length=30, blank=True)
    contact_address = models.CharField(max_length=200, blank=True, default="Cotonou, Bénin")
    footer_description = models.TextField(
        blank=True,
        default="Média numérique béninois dédié à l'information en continu : articles, direct, reportages et interviews.",
    )
    facebook_url = models.URLField(blank=True, default="https://www.facebook.com/profile.php?id=100092600381179")
    instagram_url = models.URLField(blank=True, default="https://www.instagram.com/itr_tv/")
    youtube_url = models.URLField(blank=True, default="https://www.youtube.com/@InfosenTempsR%C3%A9elTV")
    whatsapp_url = models.URLField(blank=True, default="https://whatsapp.com/channel/0029VaJlAKUDp2Q7oIN36632")
    linkedin_url = models.URLField(blank=True, default="https://www.linkedin.com/feed/")
    tiktok_url = models.URLField(blank=True, default="https://www.tiktok.com/@infosentempsreel?lang=fr")
    x_url = models.URLField(blank=True, default="https://x.com/itr_tv")

    class Meta:
        verbose_name = "Paramètres du site"
        verbose_name_plural = "Paramètres du site"

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        pass

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Paramètres du site"


class ContactMessage(models.Model):
    """Message envoyé depuis le formulaire de contact public."""

    full_name = models.CharField(max_length=150)
    email = models.EmailField()
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} <{self.email}>"
