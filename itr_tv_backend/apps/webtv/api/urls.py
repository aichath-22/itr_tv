from rest_framework.routers import DefaultRouter
from .views import ProgramViewSet, LiveStreamViewSet, VideoViewSet

router = DefaultRouter()
router.register("programs", ProgramViewSet, basename="program")
router.register("live", LiveStreamViewSet, basename="livestream")
router.register("videos", VideoViewSet, basename="video")

urlpatterns = router.urls
