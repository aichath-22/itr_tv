from django.urls import path
from .views import BreakingNewsListView

urlpatterns = [
    path("breaking/", BreakingNewsListView.as_view(), name="breaking-news-list"),
]
