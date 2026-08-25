from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Article, Category

User = get_user_model()


class ArticleCreationTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Politique", slug="politique")
        self.journalist = User.objects.create_user(
            username="journaliste1", password="pass12345", role=User.Role.JOURNALISTE,
        )
        self.other_journalist = User.objects.create_user(
            username="journaliste2", password="pass12345", role=User.Role.JOURNALISTE,
        )

    def test_journalist_can_create_article_with_category_and_gets_generated_slug(self):
        self.client.force_authenticate(self.journalist)
        response = self.client.post(
            "/api/v1/articles/",
            {"title": "Un grand titre pour l'actualité", "content": "Contenu.", "category": self.category.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(response.data["slug"])
        self.assertEqual(response.data["status"], Article.Status.DRAFT)
        self.assertEqual(response.data["category"]["id"], self.category.id)

    def test_article_creation_without_category_fails(self):
        self.client.force_authenticate(self.journalist)
        response = self.client.post(
            "/api/v1/articles/", {"title": "Sans catégorie", "content": "Contenu."}, format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_journalist_cannot_submit_another_journalists_draft(self):
        article = Article.objects.create(
            title="Brouillon d'un autre", slug="brouillon-dun-autre", content="Contenu.",
            category=self.category, author=self.other_journalist,
        )
        self.client.force_authenticate(self.journalist)
        response = self.client.post(f"/api/v1/articles/{article.slug}/submit/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        article.refresh_from_db()
        self.assertEqual(article.status, Article.Status.DRAFT)

    def test_author_filter_returns_only_own_articles(self):
        Article.objects.create(
            title="Article de moi", slug="article-de-moi", content="Contenu.",
            category=self.category, author=self.journalist,
        )
        Article.objects.create(
            title="Article de l'autre", slug="article-de-lautre", content="Contenu.",
            category=self.category, author=self.other_journalist,
        )
        self.client.force_authenticate(self.journalist)
        response = self.client.get(f"/api/v1/articles/?author={self.journalist.id}")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [a["title"] for a in response.data["results"]]
        self.assertEqual(titles, ["Article de moi"])

    def test_owner_can_submit_own_draft(self):
        article = Article.objects.create(
            title="Mon brouillon", slug="mon-brouillon", content="Contenu.",
            category=self.category, author=self.journalist,
        )
        self.client.force_authenticate(self.journalist)
        response = self.client.post(f"/api/v1/articles/{article.slug}/submit/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        article.refresh_from_db()
        self.assertEqual(article.status, Article.Status.PENDING)
        self.assertEqual(article.reviews.count(), 1)


class ArticleLikeTests(APITestCase):
    def setUp(self):
        self.category = Category.objects.create(name="Sport", slug="sport")
        self.journalist = User.objects.create_user(
            username="journaliste_like", password="pass12345", role=User.Role.JOURNALISTE,
        )
        self.subscriber = User.objects.create_user(
            username="abonne_like", password="pass12345", role=User.Role.ABONNE,
        )
        self.article = Article.objects.create(
            title="Article public", slug="article-public", content="Contenu.",
            category=self.category, author=self.journalist, status=Article.Status.PUBLISHED,
        )

    def test_anonymous_cannot_like(self):
        response = self.client.post(f"/api/v1/articles/{self.article.slug}/like/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_subscriber_can_toggle_like(self):
        self.client.force_authenticate(self.subscriber)
        first = self.client.post(f"/api/v1/articles/{self.article.slug}/like/")
        self.assertEqual(first.status_code, status.HTTP_200_OK)
        self.assertEqual(first.data, {"liked": True, "likes_count": 1})

        second = self.client.post(f"/api/v1/articles/{self.article.slug}/like/")
        self.assertEqual(second.data, {"liked": False, "likes_count": 0})

    def test_likes_count_and_is_liked_on_article_detail(self):
        self.article.liked_by.add(self.subscriber)
        self.client.force_authenticate(self.subscriber)
        response = self.client.get(f"/api/v1/articles/{self.article.slug}/")
        self.assertEqual(response.data["likes_count"], 1)
        self.assertTrue(response.data["is_liked"])
