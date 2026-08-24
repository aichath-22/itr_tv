from rest_framework import serializers
from ..models import ArticleReview


class ArticleReviewSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.username", read_only=True)
    action_display = serializers.CharField(source="get_action_display", read_only=True)

    class Meta:
        model = ArticleReview
        fields = ["id", "article", "actor", "actor_name", "action", "action_display",
                  "comment", "created_at"]
        read_only_fields = fields
