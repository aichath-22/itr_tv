from rest_framework import filters, generics, permissions
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from apps.core.permissions import IsAdmin
from .serializers import UserSerializer, RegisterSerializer, AdminUserSerializer, CreateJournalistSerializer

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


class UserDetailView(generics.RetrieveUpdateAPIView):
    """Consultation/modification (rôle, activation) d'un utilisateur.

    Pas de suppression : Article.author est en PROTECT, la désactivation
    via is_active est le mécanisme prévu plutôt qu'un delete risqué.
    """

    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdmin]
