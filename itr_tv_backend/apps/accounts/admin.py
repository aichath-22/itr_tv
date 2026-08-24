from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ("username", "email", "role", "is_verified_journalist", "is_active")
    list_filter = ("role", "is_active", "is_verified_journalist")
    fieldsets = UserAdmin.fieldsets + (
        ("Informations ITR TV", {"fields": ("role", "phone", "avatar", "bio", "is_verified_journalist")}),
    )
