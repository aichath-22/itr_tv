from rest_framework import serializers
from ..models import Program, LiveStream, Video


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ["id", "name", "slug", "description", "thumbnail", "presenter"]


class LiveStreamSerializer(serializers.ModelSerializer):
    program = ProgramSerializer(read_only=True)

    class Meta:
        model = LiveStream
        fields = ["id", "title", "program", "description", "stream_url", "thumbnail",
                  "scheduled_at", "status", "peak_viewers"]


class VideoSerializer(serializers.ModelSerializer):
    program = ProgramSerializer(read_only=True)

    class Meta:
        model = Video
        fields = ["id", "title", "program", "category", "video_url", "thumbnail",
                  "duration_seconds", "views_count", "published_at"]
