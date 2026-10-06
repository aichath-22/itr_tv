from rest_framework import serializers
from ..models import SiteSettings, ContactMessage


class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = [
            "contact_email", "contact_phone", "contact_address", "footer_description",
            "facebook_url", "instagram_url", "youtube_url", "whatsapp_url",
            "linkedin_url", "tiktok_url", "x_url",
        ]


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "full_name", "email", "message", "created_at", "is_read"]
        read_only_fields = ["created_at", "is_read"]
