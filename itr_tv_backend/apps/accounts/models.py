from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        ABONNE = "abonne", "Utilisateur inscrit"
        JOURNALISTE = "journaliste", "Journaliste"
        REDACTEUR_CHEF = "redacteur_chef", "Rédacteur en chef"
        ADMIN = "admin", "Administrateur"
        SUPER_ADMIN = "super_admin", "Super administrateur"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.ABONNE)
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.URLField(blank=True)
    bio = models.TextField(blank=True)
    is_verified_journalist = models.BooleanField(default=False)

    @property
    def can_write_articles(self):
        return self.role in [
            self.Role.JOURNALISTE,
            self.Role.REDACTEUR_CHEF,
            self.Role.ADMIN,
            self.Role.SUPER_ADMIN,
        ]

    @property
    def can_validate_articles(self):
        return self.role in [self.Role.REDACTEUR_CHEF, self.Role.ADMIN, self.Role.SUPER_ADMIN]

    @property
    def can_manage_platform(self):
        return self.role in [self.Role.ADMIN, self.Role.SUPER_ADMIN]

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"
