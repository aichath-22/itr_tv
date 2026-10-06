from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import SiteSettingsView, ContactMessageViewSet

router = DefaultRouter()
router.register("contact", ContactMessageViewSet, basename="contactmessage")

urlpatterns = [
    path("settings/", SiteSettingsView.as_view(), name="site-settings"),
] + router.urls
