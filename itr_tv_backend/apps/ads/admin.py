from django.contrib import admin
from .models import Sponsor, AdBanner


@admin.register(Sponsor)
class SponsorAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(AdBanner)
class AdBannerAdmin(admin.ModelAdmin):
    list_display = ("sponsor", "placement", "is_active", "start_date", "end_date",
                     "clicks_count", "impressions_count")
    list_filter = ("placement", "is_active")
