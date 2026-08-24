from rest_framework import serializers
from ..models import Sponsor, AdBanner


class SponsorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sponsor
        fields = ["id", "name", "logo"]


class AdBannerSerializer(serializers.ModelSerializer):
    sponsor = SponsorSerializer(read_only=True)

    class Meta:
        model = AdBanner
        fields = ["id", "sponsor", "placement", "image", "target_url",
                  "start_date", "end_date", "is_active"]
