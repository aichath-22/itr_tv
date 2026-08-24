# ITR TV — Projet complet (Backend Django + Frontend React)

Ce dossier contient l'intégralité du projet, **testé de bout en bout** (backend + frontend connectés, captures d'écran vérifiées avant livraison) :

```
itr_tv_projet_complet/
├── itr_tv_backend/     Django REST Framework — API, admin, base de données
├── itr_tv_frontend/    React (Vite + Tailwind) — site public + tableau de bord
└── ARCHITECTURE.md     Document d'architecture détaillé (apps, modèles, rôles)
```

## Démarrer les deux en local

**Terminal 1 — Backend**
```bash
cd itr_tv_backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements/dev.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
→ API disponible sur http://127.0.0.1:8000/api/v1/ — Admin sur http://127.0.0.1:8000/admin/

**Terminal 2 — Frontend**
```bash
cd itr_tv_frontend
npm install
cp .env.example .env
npm run dev
```
→ Site disponible sur http://localhost:5173/

Les deux `README.md` de chaque dossier détaillent la suite (Docker, déploiement, structure du code).
