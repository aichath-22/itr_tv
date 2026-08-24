from django.utils import timezone
from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from apps.core.permissions import IsJournalist, IsOwnerOrReadOnly
from ..models import Category, Tag, Article, Comment
from .serializers import (
    CategorySerializer, TagSerializer, ArticleListSerializer,
    ArticleDetailSerializer, CommentSerializer,
)


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = "slug"


class TagViewSet(viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class ArticleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsJournalist, IsOwnerOrReadOnly]
    lookup_field = "slug"
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["category", "status", "tags"]
    search_fields = ["title", "content", "excerpt"]
    ordering_fields = ["published_at", "views_count", "created_at"]

    def get_queryset(self):
        qs = Article.objects.select_related("category", "author").prefetch_related("tags")
        if self.request.user.is_authenticated and self.request.user.can_write_articles:
            return qs
        return qs.filter(status=Article.Status.PUBLISHED)

    def get_serializer_class(self):
        if self.action == "list":
            return ArticleListSerializer
        return ArticleDetailSerializer

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, status=Article.Status.DRAFT)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Article.objects.filter(pk=instance.pk).update(views_count=instance.views_count + 1)
        instance.refresh_from_db()
        return Response(self.get_serializer(instance).data)

    @action(detail=True, methods=["post"], permission_classes=[IsJournalist])
    def submit(self, request, slug=None):
        """Le journaliste soumet son brouillon à validation."""
        article = self.get_object()
        article.status = Article.Status.PENDING
        article.save(update_fields=["status"])
        return Response({"status": article.status})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def review(self, request, slug=None):
        """Le rédacteur en chef valide ou rejette un article (voir CanValidateArticle)."""
        if not request.user.can_validate_articles:
            return Response({"detail": "Permission refusée."}, status=status.HTTP_403_FORBIDDEN)

        article = self.get_object()
        decision = request.data.get("decision")  # "approve" | "reject"
        if decision == "approve":
            article.status = Article.Status.PUBLISHED
            article.validated_by = request.user
            article.published_at = timezone.now()
        elif decision == "reject":
            article.status = Article.Status.REJECTED
            article.validated_by = request.user
        else:
            return Response({"detail": "decision doit être 'approve' ou 'reject'."},
                             status=status.HTTP_400_BAD_REQUEST)
        article.save(update_fields=["status", "validated_by", "published_at"])
        return Response({"status": article.status})


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.select_related("author", "article")
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
