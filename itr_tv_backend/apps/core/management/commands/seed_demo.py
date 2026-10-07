"""Jeu de données de démonstration réaliste, pour voir le rendu réel du site
(articles, catégories, émissions, direct, vidéos, bannière, breaking news)
plutôt qu'une base vide. Idempotent : relance la commande pour repartir
d'un jeu de données propre, les anciennes entrées de démo sont supprimées
avant recréation (identifiées par le préfixe "demo-").
"""
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.ads.models import AdBanner, Sponsor
from apps.articles.models import Article, Category, Comment, Tag
from apps.notifications.models import BreakingNews
from apps.webtv.models import LiveStream, Program, Video

User = get_user_model()

DEMO_PASSWORD = "Demo1234!"

CATEGORIES = ["Politique", "Économie", "Société", "Culture", "Sport", "International", "Technologies"]

ARTICLES = [
    ("Le gouvernement annonce un plan de relance pour les PME béninoises", "Politique"),
    ("Cotonou accueille le sommet régional sur le climat", "International"),
    ("La Coupe d'Afrique des Nations : le Bénin qualifié pour les quarts", "Sport"),
    ("Nouvelle ligne de bus rapide entre Cotonou et Porto-Novo dès janvier", "Société"),
    ("Le franc CFA face aux incertitudes économiques régionales", "Économie"),
    ("Portrait : ces jeunes entrepreneurs qui réinventent l'agriculture locale", "Économie"),
    ("Festival international du film de Ouidah : la programmation dévoilée", "Culture"),
    ("Éducation : vers une réforme du baccalauréat béninois", "Société"),
    ("Santé publique : campagne nationale de vaccination lancée", "Société"),
    ("Le Bénin renforce ses liens diplomatiques avec le Nigeria", "International"),
    ("Technologies : le numérique s'impose dans l'administration béninoise", "Technologies"),
    ("Culture : le Vodun Days attire un record de visiteurs à Ouidah", "Culture"),
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
            f"{Video.objects.filter(title__startswith='Demo :').count()} vidéos, "
            f"{len(banners)} bannière(s), {len(news)} breaking news.\n"
        ))
        self.stdout.write("Comptes de démonstration (mot de passe pour tous : " + DEMO_PASSWORD + ") :")
        for u in users.values():
            self.stdout.write(f"  - {u.username}  ({u.get_role_display()})")
        self.stdout.write(
            "\nImages : une photo différente par contenu, générée depuis picsum.photos "
            "(nécessite une connexion internet côté navigateur pour s'afficher)."
        )

    # -- media -----------------------------------------------------------
    def _image(self, key, width=800, height=450):
        """Une image différente par élément (clé unique = photo stable et reproductible),
        hébergée sur le web plutôt que recyclée localement."""
        return f"https://picsum.photos/seed/itrtv-{key}/{width}/{height}"

    # -- cleanup -----------------------------------------------------------
    def _clean(self):
        Article.objects.filter(slug__startswith="demo-").delete()
        # Category est protégée (PROTECT) : ne supprimer que les catégories de démo
        # qu'aucun article réel (créé manuellement entre deux exécutions) n'utilise encore.
        Category.objects.filter(slug__startswith="demo-", articles__isnull=True).delete()
        Tag.objects.filter(name__startswith="Demo ").delete()
        Program.objects.filter(slug__startswith="demo-").delete()
        LiveStream.objects.filter(title__startswith="Demo :").delete()
        Video.objects.filter(title__startswith="Demo :").delete()
        Sponsor.objects.filter(name__startswith="Demo ").delete()
        BreakingNews.objects.filter(title__startswith="[Démo]").delete()

    # -- users -----------------------------------------------------------
    def _create_users(self):
        specs = [
            ("asossou", User.Role.JOURNALISTE, "Awa", "Sossou",
             "Journaliste chez ITR TV, spécialisée dans l'actualité politique et économique béninoise."),
            # L'administrateur fait aussi office de rédacteur en chef (valide les articles).
            ("fhounkpe", User.Role.ADMIN, "Fabrice", "Hounkpê",
             "Rédacteur en chef d'ITR TV. Supervise la ligne éditoriale et valide chaque publication avant sa mise en ligne."),
        ]
        users = {}
        for username, role, first_name, last_name, bio in specs:
            u, _ = User.objects.get_or_create(
                username=username,
                defaults={"role": role, "first_name": first_name, "last_name": last_name},
            )
            u.role = role
            u.first_name, u.last_name = first_name, last_name
            u.bio = bio
            # avatar : champ d'upload réel désormais (cahier des charges §8) — pas de
            # données de démo ici, le journaliste/admin uploade sa propre photo.
            u.is_active = True
            u.set_password(DEMO_PASSWORD)
            u.save()
            users[role] = u
        return users

    # -- content -----------------------------------------------------------
    def _create_categories(self):
        cats = {}
        for name in CATEGORIES:
            cats[name], _ = Category.objects.get_or_create(
                slug=f"demo-{name.lower()}", defaults={"name": name},
            )
        return cats

    def _create_tags(self):
        return [Tag.objects.create(name=f"Demo {n}") for n in ["Actualité", "Analyse", "Reportage"]]

    def _create_articles(self, users, categories, tags):
        author = users[User.Role.JOURNALISTE]
        validator = users[User.Role.ADMIN]
        now = timezone.now()
        articles = []
        for i, (title, cat_name) in enumerate(ARTICLES):
            article = Article.objects.create(
                title=title,
                slug=f"demo-article-{i + 1}",
                excerpt=EXCERPT,
                content=CONTENT,
                # cover_image : champ d'upload réel désormais (cahier des charges §8) —
                # pas de donnée de démo, le journaliste uploade sa propre image.
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
            presenter="Fabrice Hounkpê", thumbnail=self._image("programme-journal-du-soir"),
        )
        program2 = Program.objects.create(
            name="ITR Matin", slug="demo-itr-matin",
            presenter="Awa Sossou", thumbnail=self._image("programme-itr-matin"),
        )
        now = timezone.now()
        live = LiveStream.objects.create(
            title="Demo : Édition spéciale élections", program=program1,
            description="Suivez en direct les résultats et analyses de la soirée électorale.",
            thumbnail=self._image("direct-edition-speciale"), stream_url="",
            scheduled_at=now, status=LiveStream.Status.LIVE, peak_viewers=1850,
        )
        LiveStream.objects.create(
            title="Demo : Journal du matin", program=program2,
            thumbnail=self._image("direct-journal-du-matin"), stream_url="",
            scheduled_at=now + timedelta(hours=14), status=LiveStream.Status.SCHEDULED,
        )
        for i in range(1, 5):
            Video.objects.create(
                title=f"Demo : Reportage sur la vie à Cotonou #{i}",
                program=program1 if i % 2 else program2,
                video_url="https://youtube.com/watch?v=demo",
                thumbnail=self._image(f"video-cotonou-{i}"),
                duration_seconds=180 + i * 40,
                views_count=1200 - i * 150,
                source_live=live if i == 1 else None,
            )
        return program1, live

    def _create_ads(self):
        sponsor = Sponsor.objects.create(name="Demo Sponsor Bénin Telecom", logo=self._image("sponsor-logo"))
        today = timezone.now().date()
        banners = [
            AdBanner.objects.create(
                sponsor=sponsor, placement=AdBanner.Placement.HOME_TOP,
                image=self._image("banniere-home-top"), target_url="https://example.com",
                start_date=today - timedelta(days=5), end_date=today + timedelta(days=30),
                is_active=True,
            ),
            AdBanner.objects.create(
                sponsor=sponsor, placement=AdBanner.Placement.ARTICLE_INLINE,
                image=self._image("banniere-article-inline"), target_url="https://example.com",
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
