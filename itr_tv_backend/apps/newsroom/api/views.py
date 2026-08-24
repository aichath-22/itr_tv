from rest_framework import generics
from apps.core.permissions import IsJournalist
from ..models import ArticleReview
from .serializers import ArticleReviewSerializer


class ArticleReviewListView(generics.ListAPIView):
    """Historique du circuit de validation (cahier des charges §4.3).

    Un journaliste ne voit que l'historique de ses propres articles ;
    rédacteur en chef et rôles supérieurs voient tout.
    """

    serializer_class = ArticleReviewSerializer
    permission_classes = [IsJournalist]

    def get_queryset(self):
        qs = ArticleReview.objects.select_related("actor", "article")
        user = self.request.user
        if not user.can_validate_articles:
            qs = qs.filter(article__author=user)
        article_id = self.request.query_params.get("article")
        if article_id:
            qs = qs.filter(article_id=article_id)
        return qs
