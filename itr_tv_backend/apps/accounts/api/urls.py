from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, MeView, ThrottledTokenObtainPairView,
    UserListView, UserDetailView, CreateJournalistView,
)

urlpatterns = [
    path("register/", RegisterView.as_view(), name="auth-register"),
    path("login/", ThrottledTokenObtainPairView.as_view(), name="auth-login"),
    path("refresh/", TokenRefreshView.as_view(), name="auth-refresh"),
    path("me/", MeView.as_view(), name="auth-me"),
    path("users/", UserListView.as_view(), name="auth-user-list"),
    path("users/<int:pk>/", UserDetailView.as_view(), name="auth-user-detail"),
    path("journalists/", CreateJournalistView.as_view(), name="auth-create-journalist"),
]
