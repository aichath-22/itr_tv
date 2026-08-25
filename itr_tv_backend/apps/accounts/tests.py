from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class UserManagementTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin1", password="pass12345", role=User.Role.ADMIN,
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

    def test_admin_cannot_change_own_role(self):
        self.client.force_authenticate(self.admin)
        response = self.client.patch(
            f"/api/v1/auth/users/{self.admin.id}/", {"role": "journaliste"}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class CreateJournalistTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin2", password="pass12345", role=User.Role.ADMIN,
        )
        self.journalist = User.objects.create_user(
            username="journaliste_existant", password="pass12345", role=User.Role.JOURNALISTE,
        )
        self.subscriber = User.objects.create_user(username="abonne2", password="pass12345", role=User.Role.ABONNE)

    def test_admin_can_create_journalist(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            "/api/v1/auth/journalists/",
            {"username": "nouveau_journaliste", "email": "nj@example.com", "password": "SolidPass123!",
             "first_name": "Nouveau", "last_name": "Journaliste"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        created = User.objects.get(username="nouveau_journaliste")
        self.assertEqual(created.role, User.Role.JOURNALISTE)
        self.assertTrue(created.check_password("SolidPass123!"))

    def test_journalist_cannot_create_journalist(self):
        self.client.force_authenticate(self.journalist)
        response = self.client.post(
            "/api/v1/auth/journalists/",
            {"username": "x", "email": "x@example.com", "password": "SolidPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_subscriber_cannot_create_journalist(self):
        self.client.force_authenticate(self.subscriber)
        response = self.client.post(
            "/api/v1/auth/journalists/",
            {"username": "y", "email": "y@example.com", "password": "SolidPass123!"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
