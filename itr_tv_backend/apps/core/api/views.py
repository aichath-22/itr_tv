from django.conf import settings as dj_settings
from django.core.mail import send_mail
from rest_framework import generics, viewsets, permissions
from rest_framework.throttling import ScopedRateThrottle
from apps.core.permissions import IsAdmin
from ..models import SiteSettings, ContactMessage
from .serializers import SiteSettingsSerializer, ContactMessageSerializer


class SiteSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = SiteSettingsSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def get_object(self):
        return SiteSettings.load()


def _notify_contact(message):
    try:
        recipient = SiteSettings.load().contact_email
    except Exception:
        recipient = ""
    if not recipient:
        return
    send_mail(
        subject=f"[ITR TV] Nouveau message de contact — {message.full_name}",
        message=f"De : {message.full_name} <{message.email}>\n\n{message.message}",
        from_email=dj_settings.DEFAULT_FROM_EMAIL,
        recipient_list=[recipient],
        fail_silently=True,
    )


class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    http_method_names = ["get", "post", "patch", "delete", "head", "options"]

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def get_throttles(self):
        if self.action == "create":
            self.throttle_scope = "contact"
            return [ScopedRateThrottle()]
        return []

    def perform_create(self, serializer):
        message = serializer.save()
        _notify_contact(message)
