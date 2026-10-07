from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, MeView, ThrottledTokenObtainPairView,
    UserListView, UserDetailView, CreateJournalistView, TeamListView,
    PasswordResetRequestView, PasswordResetConfirmView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", ThrottledTokenObtainPairView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("password-reset/", PasswordResetRequestView.as_view(), name="auth-password-reset"),
    path("password-reset-confirm/", PasswordResetConfirmView.as_view(), name="auth-password-reset-confirm"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("users/", UserListView.as_view(), name="auth-user-list"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="auth-user-detail"),
    path("journalists/", CreateJournalistView.as_view(), name="auth-create-journalist"),
    path("team/", TeamListView.as_view(), name="auth-team-list"),
]
