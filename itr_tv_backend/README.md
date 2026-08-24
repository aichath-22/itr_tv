# ITR TV — Backend Django

Backend Django REST Framework pour le projet ITR TV (voir cahier des charges).
Ce projet a été **testé et démarre correctement** (migrations + endpoints API vérifiés).

## Démarrage rapide (développement local)

```bash
python3 -m venv venv
source venv/bin/activate          # Windows : venv\Scripts\activate

pip install -r requirements/dev.txt

cp .env.example .env              # puis ajuste les valeurs si besoin

python manage.py migrate
python manage.py createsuperuser  # pour accéder à /admin/

python manage.py runserver
```

- API : http://127.0.0.1:8000/api/v1/
- Admin : http://127.0.0.1:8000/admin/

Par défaut, le projet tourne en `config.settings.dev` avec **SQLite** (aucune base à installer pour démarrer). Pour utiliser PostgreSQL en local, décommente la config dans `config/settings/dev.py`.

## Endpoints principaux

| Endpoint | Description |
|---|---|
| `POST /api/v1/auth/register/` | Inscription |
| `POST /api/v1/auth/login/` | Connexion (JWT) |
| `POST /api/v1/auth/refresh/` | Rafraîchir le token |
| `GET/PATCH /api/v1/auth/me/` | Profil utilisateur connecté |
| `GET/POST /api/v1/articles/` | Liste / création d'articles |
| `POST /api/v1/articles/{slug}/submit/` | Journaliste : soumettre à validation |
| `POST /api/v1/articles/{slug}/review/` | Rédacteur en chef : approuver/rejeter |
| `GET /api/v1/articles/categories/` | Catégories |
| `GET /api/v1/webtv/live/` | Directs |
| `GET /api/v1/webtv/videos/` | Bibliothèque vidéo |
| `GET /api/v1/ads/banners/?placement=home_top` | Bannières actives par emplacement |
| `POST /api/v1/newsletter/subscribe/` | Inscription newsletter |
| `GET /api/v1/notifications/breaking/` | Breaking news actives |
| `GET /api/v1/stats/dashboard/` | Tableau de bord (admin/super admin uniquement) |

## Rôles (voir `apps/accounts/models.py`)

`abonne`, `journaliste`, `redacteur_chef`, `admin`, `super_admin` — voir la matrice de permissions dans `architecture_django_itr_tv.md` fourni précédemment.

## Déploiement

```bash
cp .env.example .env   # remplir les vraies valeurs de production
docker compose up -d --build
docker compose exec web python manage.py migrate
docker compose exec web python manage.py createsuperuser
```

Le `docker-compose.yml` lance : PostgreSQL, Redis, l'app Django (Gunicorn), et Nginx en reverse proxy.

## Prochaines étapes suggérées

1. Brancher le front React (voir cahier des charges — CORS déjà configuré).
2. Activer Cloudinary pour les médias (config prête, commentée dans `config/settings/prod.py`).
3. Ajouter Django Channels pour les notifications temps réel (breaking news en push).
4. Écrire les tests (squelettes `tests.py` présents dans chaque app).
5. Brancher le flux RTMP/HLS réel pour `webtv.LiveStream.stream_url`.
