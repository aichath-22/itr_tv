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
    """Gestion des utilisateurs par l'administrateur (qui fait aussi
    office de rédacteur en chef). L'admin renseigne aussi la photo et la
    bio affichées sur la page Rédaction (portfolio de l'équipe)."""

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name",
                  "role", "is_active", "is_verified_journalist", "date_joined",
                  "avatar", "bio"]
        read_only_fields = ["username", "email", "first_name", "last_name", "date_joined"]

    def validate_role(self, value):
        request = self.context["request"]
        target = self.instance
        if target and target.id == request.user.id:
            raise serializers.ValidationError("Vous ne pouvez pas modifier votre propre rôle.")
        return value


class PublicTeamMemberSerializer(serializers.ModelSerializer):
    """Champs publics affichés sur la page Rédaction (équipe éditoriale)."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "full_name", "role", "avatar", "bio"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class CreateJournalistSerializer(serializers.ModelSerializer):
    """L'administrateur crée directement un compte journaliste
    (pas d'auto-inscription possible pour ce rôle)."""

    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "first_name", "last_name"]

    def create(self, validated_data):
        return User.objects.create_user(role=User.Role.JOURNALISTE, **validated_data)


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
