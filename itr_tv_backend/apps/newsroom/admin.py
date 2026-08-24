from django.contrib import admin
from .models import ArticleReview


@admin.register(ArticleReview)
class ArticleReviewAdmin(admin.ModelAdmin):
    list_display = ("article", "actor", "action", "created_at")
    list_filter = ("action",)
