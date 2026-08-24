from rest_framework import generics, permissions
from ..models import BreakingNews
from .serializers import BreakingNewsSerializer


class BreakingNewsListView(generics.ListAPIView):
    serializer_class = BreakingNewsSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return BreakingNews.objects.filter(is_active=True)
