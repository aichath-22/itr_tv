import datetime
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Sponsor, AdBanner

User = get_user_model()


class AdBannerManagementTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_user(username="ads_admin", password="pass12345", role=User.Role.ADMIN)
        self.sponsor = Sponsor.objects.create(name="Sponsor Test", logo="")

    def test_admin_can_create_banner_with_sponsor(self):
        self.client.force_authenticate(self.admin)
        response = self.client.post(
            "/api/v1/ads/banners/",
            {
                "sponsor": self.sponsor.id, "placement": "home_top",
                "image": "https://example.com/banner.png", "target_url": "https://example.com",
                "start_date": "2026-01-01", "end_date": "2026-12-31", "is_active": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data["sponsor"]["id"], self.sponsor.id)

    def test_admin_sees_inactive_banner_in_list(self):
        AdBanner.objects.create(
            sponsor=self.sponsor, placement="home_top", image="x", target_url="x",
            start_date=datetime.date(2020, 1, 1), end_date=datetime.date(2020, 1, 2), is_active=False,
        )
        self.client.force_authenticate(self.admin)
        response = self.client.get("/api/v1/ads/banners/")
        self.assertEqual(len(response.data["results"]), 1)

    def test_public_does_not_see_inactive_banner(self):
        AdBanner.objects.create(
            sponsor=self.sponsor, placement="home_top", image="x", target_url="x",
            start_date=datetime.date(2020, 1, 1), end_date=datetime.date(2020, 1, 2), is_active=False,
        )
        response = self.client.get("/api/v1/ads/banners/")
        self.assertEqual(len(response.data["results"]), 0)

    def test_track_click_increments_counter(self):
        banner = AdBanner.objects.create(
            sponsor=self.sponsor, placement="home_top", image="x", target_url="x",
            start_date=datetime.date(2026, 1, 1), end_date=datetime.date(2026, 12, 31),
        )
        response = self.client.post(f"/api/v1/ads/banners/{banner.id}/track_click/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        banner.refresh_from_db()
        self.assertEqual(banner.clicks_count, 1)
