from rest_framework import viewsets, permissions
from apps.core.permissions import IsAdmin
from ..models import Program, LiveStream, Video
from .serializers import ProgramSerializer, LiveStreamSerializer, VideoSerializer


class ProgramViewSet(viewsets.ModelViewSet):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return super().get_permissions()


class LiveStreamViewSet(viewsets.ModelViewSet):
    queryset = LiveStream.objects.select_related("program")
    serializer_class = LiveStreamSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return super().get_permissions()


class VideoViewSet(viewsets.ModelViewSet):
    queryset = Video.objects.select_related("program", "category")
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_permissions(self):
        if self.action in ["create", "update", "partial_update", "destroy"]:
            return [IsAdmin()]
        return super().get_permissions()
