from django.urls import path
from .views import ArticleReviewListView

urlpatterns = [
    path("reviews/", ArticleReviewListView.as_view(), name="newsroom-reviews"),
]
