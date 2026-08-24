from rest_framework import serializers
from ..models import BreakingNews


class BreakingNewsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BreakingNews
        fields = ["id", "title", "link", "created_at"]
