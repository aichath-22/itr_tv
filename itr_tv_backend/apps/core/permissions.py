from rest_framework import permissions


class IsJournalist(permissions.BasePermission):
    """Autorise l'écriture aux journalistes et rôles supérieurs."""

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return bool(request.user and request.user.is_authenticated and request.user.can_write_articles)


class CanValidateArticle(permissions.BasePermission):
    """Réservé au rédacteur en chef et rôles supérieurs."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.can_validate_articles)


class IsAdmin(permissions.BasePermission):
    """L'administrateur fait aussi office de rédacteur en chef."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.can_manage_platform)


class IsOwnerOrReadOnly(permissions.BasePermission):
    """Un journaliste ne modifie que ses propres articles (sauf rôles supérieurs)."""

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.can_validate_articles:
            return True
        return obj.author_id == request.user.id
