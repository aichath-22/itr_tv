from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Program, LiveStream

User = get_user_model()


class WebTVManagementTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="webtv_admin", password="pass12345", role=User.Role.ADMIN)
        self.program = Program.objects.create(name="Journal du soir", slug="journal-du-soir")

    def test_admin_can_create_livestream_with_program(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            "/api/v1/webtv/live/",
            {
                "title": "Édition spéciale", "program": self.program.id,
                "stream_url": "https://example.com/live.m3u8",
                "scheduled_at": timezone.now().isoformat(),
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data["program"]["id"], self.program.id)

    def test_livestream_without_program_is_allowed(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            "/api/v1/webtv/live/",
            {"title": "Direct sans émission", "stream_url": "https://example.com/live.m3u8",
             "scheduled_at": timezone.now().isoformat()},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertIsNone(response.data["program"])

    def test_non_admin_cannot_create_livestream(self):
        subscriber = User.objects.create_user(username="webtv_abonne", password="pass12345")
        self.client.force_authenticate(subscriber)
        response = self.client.post(
            "/api/v1/webtv/live/",
            {"title": "X", "scheduled_at": timezone.now().isoformat()},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
