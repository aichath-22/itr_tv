from rest_framework import serializers
from ..models import Program, LiveStream, Video


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ["id", "name", "slug", "description", "thumbnail", "presenter"]


class LiveStreamSerializer(serializers.ModelSerializer):
    program = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all(), required=False, allow_null=True,
    )

    class Meta:
        model = LiveStream
        fields = ["id", "title", "program", "description", "stream_url", "thumbnail",
                  "scheduled_at", "status", "peak_viewers"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["program"] = ProgramSerializer(instance.program).data if instance.program else None
        return rep


class VideoSerializer(serializers.ModelSerializer):
    program = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all(), required=False, allow_null=True,
    )

    class Meta:
        model = Video
        fields = ["id", "title", "program", "category", "video_url", "thumbnail",
                  "duration_seconds", "views_count", "published_at", "source_live"]

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep["program"] = ProgramSerializer(instance.program).data if instance.program else None
        return rep
