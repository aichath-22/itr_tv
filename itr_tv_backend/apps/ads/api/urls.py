from rest_framework.routers import DefaultRouter
from .views import SponsorViewSet, AdBannerViewSet

router = DefaultRouter()
router.register("sponsors", SponsorViewSet, basename="sponsor")
router.register("banners", AdBannerViewSet, basename="adbanner")

urlpatterns = router.urls
