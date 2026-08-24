from django.contrib import admin
from .models import Program, LiveStream, Video


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ("name", "presenter")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(LiveStream)
class LiveStreamAdmin(admin.ModelAdmin):
    list_display = ("title", "program", "status", "scheduled_at", "peak_viewers")
    list_filter = ("status",)


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    list_display = ("title", "program", "category", "views_count", "published_at")
    list_filter = ("program", "category")
