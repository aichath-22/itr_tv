from django.db.models import Sum, Count
from rest_framework.views import APIView
from rest_framework.response import Response
from apps.core.permissions import IsAdminOrSuperAdmin
from apps.articles.models import Article
from apps.webtv.models import Video, LiveStream


class DashboardView(APIView):
    """Tableau de bord global — statistiques d'audience (cahier des charges §4.8)."""

    permission_classes = [IsAdminOrSuperAdmin]

    def get(self, request):
        articles = Article.objects.filter(status=Article.Status.PUBLISHED)
        data = {
            "total_published_articles": articles.count(),
            "total_article_views": articles.aggregate(total=Sum("views_count"))["total"] or 0,
            "total_video_views": Video.objects.aggregate(total=Sum("views_count"))["total"] or 0,
            "total_live_streams": LiveStream.objects.count(),
            "peak_live_viewers_ever": LiveStream.objects.order_by("-peak_viewers")
                                                        .values_list("peak_viewers", flat=True).first() or 0,
            "top_articles": list(
                articles.order_by("-views_count")
                        .values("title", "slug", "views_count")[:10]
            ),
            "articles_by_journalist": list(
                articles.values("author__username")
                        .annotate(count=Count("id"))
                        .order_by("-count")[:10]
            ),
        }
        return Response(data)
