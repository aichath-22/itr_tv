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
