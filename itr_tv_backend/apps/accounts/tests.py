from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class UserManagementTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="admin1", password="pass12345", role=User.Role.ADMIN)
        self.super_admin = User.objects.create_user(
            username="super1", password="pass12345", role=User.Role.SUPER_ADMIN,
        )
        self.subscriber = User.objects.create_user(username="abonne1", password="pass12345", role=User.Role.ABONNE)

    def test_admin_can_list_users(self):
        self.client.force_authenticate(self.admin)
        response = self.client.get("/api/v1/auth/users/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_subscriber_cannot_list_users(self):
        self.client.force_authenticate(self.subscriber)
        response = self.client.get("/api/v1/auth/users/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_promote_subscriber_to_journalist(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f"/api/v1/auth/users/{self.subscriber.id}/", {"role": "journaliste"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.subscriber.refresh_from_db()
        self.assertEqual(self.subscriber.role, User.Role.JOURNALISTE)

    def test_admin_cannot_promote_to_admin(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f"/api/v1/auth/users/{self.subscriber.id}/", {"role": "admin"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_super_admin_can_promote_to_admin(self):
        self.client.force_authenticate(self.super_admin)
        response = self.client.patch(
            f"/api/v1/auth/users/{self.subscriber.id}/", {"role": "admin"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)

    def test_admin_cannot_change_own_role(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f"/api/v1/auth/users/{self.admin.id}/", {"role": "super_admin"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
