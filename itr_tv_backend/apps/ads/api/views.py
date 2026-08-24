from django.utils import timezone
from rest_framework import viewsets, permissions
from apps.core.permissions import IsAdminOrSuperAdmin
from ..models import Sponsor, AdBanner
from .serializers import SponsorSerializer, AdBannerSerializer


class SponsorViewSet(viewsets.ModelViewSet):
    queryset = Sponsor.objects.all()
    serializer_class = SponsorSerializer
    permission_classes = [IsAdminOrSuperAdmin]


class AdBannerViewSet(viewsets.ModelViewSet):
    serializer_class = AdBannerSerializer

    def get_permissions(self):
        if self.action == "list":
            return [permissions.AllowAny()]
        return [IsAdminOrSuperAdmin()]

    def get_queryset(self):
        qs = AdBanner.objects.select_related("sponsor")
        if self.action == "list":
            today = timezone.now().date()
            qs = qs.filter(is_active=True, start_date__lte=today, end_date__gte=today)
            placement = self.request.query_params.get("placement")
            if placement:
                qs = qs.filter(placement=placement)
        return qs
