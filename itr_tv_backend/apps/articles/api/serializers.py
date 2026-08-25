from django.utils.text import slugify
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


class LikeFieldsMixin:
    def get_likes_count(self, obj):
        return obj.liked_by.count()

    def get_is_liked(self, obj):
        request = self.context.get("request")
        user = getattr(request, "user", None)
        return bool(user and user.is_authenticated and obj.liked_by.filter(pk=user.pk).exists())


class ArticleListSerializer(LikeFieldsMixin, serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    author_name = serializers.CharField(source="author.username", read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ["id", "title", "slug", "excerpt", "cover_image", "category",
                  "author_name", "status", "published_at", "views_count",
                  "likes_count", "is_liked"]


class ArticleDetailSerializer(LikeFieldsMixin, serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    author_name = serializers.CharField(source="author.username", read_only=True)
    likes_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Article
        fields = ["id", "title", "slug", "excerpt", "content", "cover_image", "attached_pdf",
                  "category", "tags", "author", "author_name", "status", "validated_by",
                  "published_at", "views_count", "likes_count", "is_liked",
                  "related_articles", "comments", "created_at", "updated_at"]
        read_only_fields = ["author", "validated_by", "views_count", "published_at", "status"]


class ArticleWriteSerializer(serializers.ModelSerializer):
    """Utilisé pour create/update — contrairement à ArticleDetailSerializer,
    category et tags sont ici modifiables (identifiants), pas des objets imbriqués
    en lecture seule. Le slug est généré côté serveur à la création."""

    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    tags = serializers.PrimaryKeyRelatedField(many=True, queryset=Tag.objects.all(), required=False)

    class Meta:
        model = Article
        fields = ["id", "title", "slug", "excerpt", "content", "cover_image", "attached_pdf",
                  "category", "tags", "status", "published_at", "views_count",
                  "related_articles", "created_at", "updated_at"]
        read_only_fields = ["slug", "status", "published_at", "views_count"]

    def create(self, validated_data):
        base_slug = slugify(validated_data["title"])[:240] or "article"
        slug = base_slug
        suffix = 1
        while Article.objects.filter(slug=slug).exists():
            suffix += 1
            slug = f"{base_slug}-{suffix}"
        validated_data["slug"] = slug
        return super().create(validated_data)

    def to_representation(self, instance):
        # Renvoie la représentation détaillée (catégorie/tags imbriqués) après écriture.
        return ArticleDetailSerializer(instance, context=self.context).data
