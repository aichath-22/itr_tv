from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ABONNE = "abonne", "Abonné"
        JOURNALISTE = "journaliste", "Journaliste"
        ADMIN = "admin", "Administrateur"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.ABONNE)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to="avatars/", blank=True)
    bio = models.TextField(blank=True)
    is_verified_journalist = models.BooleanField(default=False)

    @property
    def can_write_articles(self):
        return self.role in [self.Role.JOURNALISTE, self.Role.ADMIN]

    @property
    def can_validate_articles(self):
        """L'administrateur fait aussi office de rédacteur en chef : c'est lui qui valide les articles."""
        return self.role == self.Role.ADMIN

    @property
    def can_manage_platform(self):
        return self.role == self.Role.ADMIN

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
