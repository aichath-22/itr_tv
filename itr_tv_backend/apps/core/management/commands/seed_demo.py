"""Jeu de données de démonstration réaliste, pour voir le rendu réel du site
(articles, catégories, émissions, direct, vidéos, bannière, breaking news)
plutôt qu'une base vide. Idempotent : relance la commande pour repartir
d'un jeu de données propre, les anciennes entrées de démo sont supprimées
avant recréation (identifiées par le préfixe "demo-").
"""
import shutil
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.ads.models import AdBanner, Sponsor
from apps.articles.models import Article, Category, Comment, Tag
from apps.notifications.models import BreakingNews
from apps.webtv.models import LiveStream, Program, Video

User = get_user_model()

MEDIA_BASE_URL = "http://localhost:8000/media/demo"
DEMO_PASSWORD = "Demo1234!"

CATEGORIES = ["Politique", "Économie", "Société", "Culture", "Sport", "International", "Technologies"]

ARTICLES = [
    ("Le gouvernement annonce un plan de relance pour les PME béninoises", "Politique", 1),
    ("Cotonou accueille le sommet régional sur le climat", "International", 2),
    ("La Coupe d'Afrique des Nations : le Bénin qualifié pour les quarts", "Sport", 3),
    ("Nouvelle ligne de bus rapide entre Cotonou et Porto-Novo dès janvier", "Société", 1),
    ("Le franc CFA face aux incertitudes économiques régionales", "Économie", 2),
    ("Portrait : ces jeunes entrepreneurs qui réinventent l'agriculture locale", "Économie", 3),
    ("Festival international du film de Ouidah : la programmation dévoilée", "Culture", 1),
    ("Éducation : vers une réforme du baccalauréat béninois", "Société", 2),
    ("Santé publique : campagne nationale de vaccination lancée", "Société", 3),
    ("Le Bénin renforce ses liens diplomatiques avec le Nigeria", "International", 1),
    ("Technologies : le numérique s'impose dans l'administration béninoise", "Technologies", 2),
    ("Culture : le Vodun Days attire un record de visiteurs à Ouidah", "Culture", 3),
]

EXCERPT = (
    "Un résumé réaliste de l'article, de la longueur habituelle d'un chapô, "
    "pour vérifier l'affichage sur les cartes et en tête de l'article."
)
CONTENT = (
    "Ceci est un contenu de démonstration représentatif d'un article ITR TV. "
    "Il permet de vérifier la mise en page, la longueur de lecture et le rendu "
    "typographique sur la page article.\n\n"
    "Un deuxième paragraphe pour simuler un article de longueur réaliste, "
    "avec plusieurs blocs de texte et un retour à la ligne visible."
)


class Command(BaseCommand):
    help = "Remplit la base avec un jeu de données de démonstration réaliste (articles, émissions, vidéos, direct, bannière, breaking news)."

    def handle(self, *args, **options):
        self._copy_media()
        self._clean()
        users = self._create_users()
        categories = self._create_categories()
        tags = self._create_tags()
        articles = self._create_articles(users, categories, tags)
        self._create_comments(articles, users)
        program, live = self._create_webtv(users)
        banners = self._create_ads()
        news = self._create_breaking_news()

        self.stdout.write(self.style.SUCCESS(
            f"\nDémo créée : {len(articles)} articles, 2 émissions, 1 direct, "
            f"{Video.objects.filter(title__startswith='Demo —').count()} vidéos, "
            f"{len(banners)} bannière(s), {len(news)} breaking news.\n"
        ))
        self.stdout.write("Comptes de démonstration (mot de passe pour tous : " + DEMO_PASSWORD + ") :")
        for u in users.values():
            self.stdout.write(f"  - {u.username}  ({u.get_role_display()})")
        self.stdout.write(
            "\nImages servies depuis " + MEDIA_BASE_URL + " — nécessite que le backend "
            "tourne sur localhost:8000 (le port par défaut de `manage.py runserver`)."
        )

    # -- media -----------------------------------------------------------
    def _copy_media(self):
        src_dir = settings.BASE_DIR.parent / "itr_logos"
        dest_dir = settings.MEDIA_ROOT / "demo"
        dest_dir.mkdir(parents=True, exist_ok=True)
        sources = sorted(src_dir.glob("*.jpeg"))[:6]
        for i, src in enumerate(sources, start=1):
            shutil.copy(src, dest_dir / f"cover{i}.jpg")
        # Miniature dédiée pour les émissions/vidéos, réutilise le logo complet du front.
        front_logo = settings.BASE_DIR.parent / "itr_tv_frontend" / "src" / "assets" / "logo-full.jpeg"
        if front_logo.exists():
            shutil.copy(front_logo, dest_dir / "program.jpg")
        self.n_covers = max(len(sources), 1)

    def _cover(self, i):
        n = getattr(self, "n_covers", 1)
        return f"{MEDIA_BASE_URL}/cover{(i % n) + 1}.jpg"

    # -- cleanup -----------------------------------------------------------
    def _clean(self):
        Article.objects.filter(slug__startswith="demo-").delete()
        Category.objects.filter(slug__startswith="demo-").delete()
        Tag.objects.filter(name__startswith="Demo ").delete()
        Program.objects.filter(slug__startswith="demo-").delete()
        LiveStream.objects.filter(title__startswith="Demo —").delete()
        Video.objects.filter(title__startswith="Demo —").delete()
        Sponsor.objects.filter(name__startswith="Demo ").delete()
        BreakingNews.objects.filter(title__startswith="[Démo]").delete()

    # -- users -----------------------------------------------------------
    def _create_users(self):
        specs = [
            ("demo_journaliste", User.Role.JOURNALISTE, "Awa", "Sossou"),
            # L'administrateur fait aussi office de rédacteur en chef (valide les articles).
            ("demo_admin", User.Role.ADMIN, "Fabrice", "Hounkpê"),
        ]
        users = {}
        for username, role, first_name, last_name in specs:
            u, _ = User.objects.get_or_create(
                username=username,
                defaults={"role": role, "first_name": first_name, "last_name": last_name},
            )
            u.role = role
            u.first_name, u.last_name = first_name, last_name
            u.is_active = True
            u.set_password(DEMO_PASSWORD)
            u.save()
            users[role] = u
        return users

    # -- content -----------------------------------------------------------
    def _create_categories(self):
        cats = {}
        for name in CATEGORIES:
            cats[name] = Category.objects.create(name=name, slug=f"demo-{name.lower()}")
        return cats

    def _create_tags(self):
        return [Tag.objects.create(name=f"Demo {n}") for n in ["Actualité", "Analyse", "Reportage"]]

    def _create_articles(self, users, categories, tags):
        author = users[User.Role.JOURNALISTE]
        validator = users[User.Role.ADMIN]
        now = timezone.now()
        articles = []
        for i, (title, cat_name, cover_idx) in enumerate(ARTICLES):
            article = Article.objects.create(
                title=title,
                slug=f"demo-article-{i + 1}",
                excerpt=EXCERPT,
                content=CONTENT,
                cover_image=self._cover(cover_idx),
                category=categories[cat_name],
                author=author,
                validated_by=validator,
                status=Article.Status.PUBLISHED,
                published_at=now - timedelta(hours=i * 5),
                views_count=(len(ARTICLES) - i) * 87,
            )
            article.tags.add(tags[i % len(tags)])
            articles.append(article)
        return articles

    def _create_comments(self, articles, users):
        Comment.objects.create(
            article=articles[0], author=users[User.Role.ADMIN],
            content="Bon article, merci pour ce suivi.",
        )

    def _create_webtv(self, users):
        program1 = Program.objects.create(
            name="Journal du Soir", slug="demo-journal-du-soir",
            presenter="Fabrice Hounkpê", thumbnail=f"{MEDIA_BASE_URL}/program.jpg",
        )
        program2 = Program.objects.create(
            name="ITR Matin", slug="demo-itr-matin",
            presenter="Awa Sossou", thumbnail=f"{MEDIA_BASE_URL}/program.jpg",
        )
        now = timezone.now()
        live = LiveStream.objects.create(
            title="Demo — Édition spéciale élections", program=program1,
            description="Suivez en direct les résultats et analyses de la soirée électorale.",
            thumbnail=self._cover(4), stream_url="",
            scheduled_at=now, status=LiveStream.Status.LIVE, peak_viewers=1850,
        )
        LiveStream.objects.create(
            title="Demo — Journal du matin", program=program2,
            thumbnail=self._cover(5), stream_url="",
            scheduled_at=now + timedelta(hours=14), status=LiveStream.Status.SCHEDULED,
        )
        for i in range(1, 5):
            Video.objects.create(
                title=f"Demo — Reportage : la vie à Cotonou #{i}",
                program=program1 if i % 2 else program2,
                video_url="https://youtube.com/watch?v=demo",
                thumbnail=self._cover(i + 1),
                duration_seconds=180 + i * 40,
                views_count=1200 - i * 150,
                source_live=live if i == 1 else None,
            )
        return program1, live

    def _create_ads(self):
        sponsor = Sponsor.objects.create(name="Demo Sponsor Bénin Telecom", logo=self._cover(2))
        today = timezone.now().date()
        banners = [
            AdBanner.objects.create(
                sponsor=sponsor, placement=AdBanner.Placement.HOME_TOP,
                image=self._cover(3), target_url="https://example.com",
                start_date=today - timedelta(days=5), end_date=today + timedelta(days=30),
                is_active=True,
            ),
            AdBanner.objects.create(
                sponsor=sponsor, placement=AdBanner.Placement.ARTICLE_INLINE,
                image=self._cover(6), target_url="https://example.com",
                start_date=today - timedelta(days=5), end_date=today + timedelta(days=30),
                is_active=True,
            ),
        ]
        return banners

    def _create_breaking_news(self):
        titles = [
            "Inondations à Cotonou : les autorités appellent à la vigilance",
            "Le Président annonce un remaniement ministériel ce soir",
            "Ouverture officielle de la saison touristique 2026",
        ]
        return [BreakingNews.objects.create(title=f"[Démo] {t}", is_active=True) for t in titles]
