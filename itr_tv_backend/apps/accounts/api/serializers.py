from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name",
                  "role", "phone", "avatar", "bio", "is_verified_journalist"]
        read_only_fields = ["role", "is_verified_journalist"]


class AdminUserSerializer(serializers.ModelSerializer):
    """Gestion des utilisateurs par un Administrateur (cahier des charges §2).

    Seul un super_admin peut promouvoir/rétrograder vers ou depuis
    admin/super_admin — la gestion des rôles sensibles reste réservée
    au Super administrateur, un Administrateur gère le reste (activation,
    rôles abonne/journaliste/redacteur_chef).
    """

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name",
                  "role", "is_active", "is_verified_journalist", "date_joined"]
        read_only_fields = ["username", "email", "first_name", "last_name", "date_joined"]

    SENSITIVE_ROLES = {User.Role.ADMIN, User.Role.SUPER_ADMIN}

    def validate_role(self, value):
        request = self.context["request"]
        target = self.instance
        if target and target.id == request.user.id:
            raise serializers.ValidationError("Vous ne pouvez pas modifier votre propre rôle.")
        if request.user.role != User.Role.SUPER_ADMIN:
            if value in self.SENSITIVE_ROLES or (target and target.role in self.SENSITIVE_ROLES):
                raise serializers.ValidationError(
                    "Seul un super administrateur peut attribuer ou modifier un rôle admin/super_admin."
                )
        return value


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["username", "email", "password", "first_name", "last_name"]

    def create(self, validated_data):
        return User.objects.create_user(
            role=User.Role.ABONNE,
            **validated_data,
        )
