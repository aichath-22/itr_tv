from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/v1/auth/", include("apps.accounts.api.urls")),
    path("api/v1/articles/", include("apps.articles.api.urls")),
    path("api/v1/newsroom/", include("apps.newsroom.api.urls")),
    path("api/v1/webtv/", include("apps.webtv.api.urls")),
    path("api/v1/ads/", include("apps.ads.api.urls")),
    path("api/v1/newsletter/", include("apps.newsletter.api.urls")),
    path("api/v1/notifications/", include("apps.notifications.api.urls")),
    path("api/v1/stats/", include("apps.stats.api.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
