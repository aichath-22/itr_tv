from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import filters, generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.core.permissions import IsAdmin
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    AdminUserSerializer,
    CreateJournalistSerializer,
    PublicTeamMemberSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ThrottledTokenObtainPairView(TokenObtainPairView):
    """Login JWT avec limite de débit dédiée (cahier des charges §9)."""

    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class CreateJournalistView(generics.CreateAPIView):
    """L'administrateur crée directement un compte journaliste."""

    queryset = User.objects.all()
    serializer_class = CreateJournalistSerializer
    permission_classes = [IsAdmin]


class UserListView(generics.ListAPIView):
    """Liste des utilisateurs — réservée à l'administrateur."""

    queryset = User.objects.all().order_by("-date_joined")
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]
    filter_backends = [filters.SearchFilter]
    search_fields = ["username", "email", "first_name", "last_name"]


class TeamListView(generics.ListAPIView):
    """Équipe éditoriale affichée publiquement sur la page Rédaction :
    le rédacteur en chef (admin) en premier, puis les journalistes."""

    serializer_class = PublicTeamMemberSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        from django.db.models import Case, IntegerField, Value, When

        order = Case(
            When(role=User.Role.ADMIN, then=Value(0)),
            When(role=User.Role.JOURNALISTE, then=Value(1)),
            default=Value(2),
            output_field=IntegerField(),
        )
        return (
            User.objects.filter(role__in=[User.Role.ADMIN, User.Role.JOURNALISTE], is_active=True)
            .annotate(role_order=order)
            .order_by("role_order", "date_joined")
        )


class UserDetailView(generics.RetrieveUpdateAPIView):
    """Consultation/modification (rôle, activation) d'un utilisateur.

    Pas de suppression : Article.author est en PROTECT, la désactivation
    via is_active est le mécanisme prévu plutôt qu'un delete risqué.
    """

    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]


class PasswordResetRequestView(APIView):
    """Demande de réinitialisation : envoie un email si le compte existe.

    Répond toujours 200 avec le même message, que l'email corresponde ou non
    à un compte, pour ne pas révéler quels emails sont enregistrés."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/reinitialiser-mot-de-passe/{uid}/{token}"
            send_mail(
                subject="[ITR TV] Réinitialisation de votre mot de passe",
                message=(
                    f"Bonjour {user.first_name or user.username},\n\n"
                    "Une demande de réinitialisation de mot de passe a été faite pour votre compte ITR TV.\n"
                    f"Cliquez sur ce lien pour choisir un nouveau mot de passe (valable 1 heure) :\n{reset_url}\n\n"
                    "Si vous n'êtes pas à l'origine de cette demande, ignorez cet email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=True,
            )

        return Response(
            {"detail": "Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    """Valide le lien reçu par email et applique le nouveau mot de passe."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        uid, token, new_password = (
            serializer.validated_data["uid"],
            serializer.validated_data["token"],
            serializer.validated_data["new_password"],
        )

        try:
            user = User.objects.get(pk=force_str(urlsafe_base64_decode(uid)))
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            user = None

        if user is None or not default_token_generator.check_token(user, token):
            return Response(
                {"detail": "Ce lien de réinitialisation est invalide ou a expiré."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()
        return Response({"detail": "Mot de passe mis à jour."}, status=status.HTTP_200_OK)
