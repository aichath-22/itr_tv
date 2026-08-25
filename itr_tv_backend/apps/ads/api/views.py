from django.db.models import F
from django.utils import timezone
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.core.permissions import IsAdmin
from ..models import Sponsor, AdBanner
from .serializers import SponsorSerializer, AdBannerSerializer


class SponsorViewSet(viewsets.ModelViewSet):
    queryset = Sponsor.objects.all()
    serializer_class = SponsorSerializer
    permission_classes = [IsAdmin]


class AdBannerViewSet(viewsets.ModelViewSet):
    serializer_class = AdBannerSerializer

    def get_permissions(self):
        if self.action in ["list", "track_click", "track_impression"]:
            return [permissions.AllowAny()]
        return [IsAdmin()]

    def get_queryset(self):
        qs = AdBanner.objects.select_related("sponsor")
        user = self.request.user
        is_manager = user.is_authenticated and user.can_manage_platform
        # Un admin gérant les bannières doit voir aussi les inactives/expirées/futures ;
        # seule la liste publique (visiteurs) applique le filtre par emplacement/dates.
        if self.action == "list" and not is_manager:
            today = timezone.now().date()
            qs = qs.filter(is_active=True, start_date__lte=today, end_date__gte=today)
            placement = self.request.query_params.get("placement")
            if placement:
                qs = qs.filter(placement=placement)
        return qs

    @action(detail=True, methods=["post"], permission_classes=[permissions.AllowAny])
    def track_click(self, request, pk=None):
        updated = AdBanner.objects.filter(pk=pk).update(clicks_count=F("clicks_count") + 1)
        if not updated:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], permission_classes=[permissions.AllowAny])
    def track_impression(self, request, pk=None):
        updated = AdBanner.objects.filter(pk=pk).update(impressions_count=F("impressions_count") + 1)
        if not updated:
            return Response(status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)
