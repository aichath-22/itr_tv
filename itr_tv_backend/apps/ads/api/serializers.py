from rest_framework import serializers
from ..models import Sponsor, AdBanner


class SponsorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = ["id", "name", "logo"]


class AdBannerSerializer(serializers.ModelSerializer):
    sponsor = serializers.PrimaryKeyRelatedField(queryset=Sponsor.objects.all())

    class Meta:
        model = AdBanner
        fields = ["id", "sponsor", "placement", "image", "target_url",
                  "start_date", "end_date", "is_active", "clicks_count", "impressions_count"]
        read_only_fields = ["clicks_count", "impressions_count"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["sponsor"] = SponsorSerializer(instance.sponsor).data
        return rep
