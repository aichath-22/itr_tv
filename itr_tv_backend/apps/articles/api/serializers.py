from rest_framework import serializers
from ..models import Category, Tag, Article, Comment


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name"]


class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "article", "author", "author_name", "content", "created_at"]
        read_only_fields = ["author"]


class ArticleListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    author_name = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Article
        fields = ["id", "title", "slug", "excerpt", "cover_image", "category",
                  "author_name", "status", "published_at", "views_count"]


class ArticleDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Article
        fields = ["id", "title", "slug", "excerpt", "content", "cover_image", "attached_pdf",
                  "category", "tags", "author", "author_name", "status", "validated_by",
                  "published_at", "views_count", "related_articles", "comments",
                  "created_at", "updated_at"]
        read_only_fields = ["author", "validated_by", "views_count", "published_at", "status"]
