# ITR TV — Frontend React

Frontend React (Vite + Tailwind CSS v4 + React Router) pour le portail ITR TV.
**Testé de bout en bout avec le backend Django** : homepage, articles, Web TV, connexion JWT, tableau de bord — tous vérifiés avec de vraies captures d'écran avant livraison.

## Démarrage rapide

```bash
npm install
cp .env.example .env    # ajuste VITE_API_URL si besoin
npm run dev
```

Le site tourne sur http://localhost:5173/

**Important** : le backend Django doit tourner en parallèle (voir `itr_tv_backend/README.md`) pour que les pages affichent du contenu réel. Sans backend actif, les pages s'affichent normalement mais vides ("Aucun article publié pour le moment"), ce qui est le comportement attendu.

## Structure

```
src/
├── api/            # client axios + fonctions d'appel à l'API Django
├── assets/         # logos ITR TV
├── components/     # Header, Footer, BreakingBar, ArticleCard, ProtectedRoute
├── context/        # AuthContext (JWT, rôles)
├── layouts/         # MainLayout (Header + Footer communs)
└── pages/          # Home, Actualites, ArticleDetail, WebTV, Emissions,
                     # Redaction, APropos, Contact, Auth, Dashboard
```

## Identité visuelle

Palette dérivée du logo officiel ITR TV (voir `tailwind` tokens dans `src/index.css`) :

- Bleu principal `#3A87E1`
- Rouge accent `#E03605`
- Fond clair `#F6F7F9` / Fond sombre `#0F2F5C`
- Titres : Archivo Black — Corps : Inter — Labels/dates : Roboto Condensed

## Rôles et accès

Le tableau de bord (`/tableau-de-bord`) s'adapte au rôle de l'utilisateur connecté (`abonne`, `journaliste`, `redacteur_chef`, `admin`, `super_admin`), récupéré depuis `/api/v1/auth/me/` :

- **Journaliste** : voit ses propres articles, peut les soumettre à validation
- **Rédacteur en chef** et plus : voit aussi la file d'articles en attente, peut valider/rejeter
- **Admin / Super admin** : voit en plus le tableau de statistiques globales

## Build production

```bash
npm run build
```

Génère `dist/` — à déployer sur Nginx, Vercel, Netlify ou tout hébergeur de fichiers statiques. Pense à définir `VITE_API_URL` vers l'URL de production du backend avant de builder.

## Prochaines étapes suggérées

1. Ajouter un éditeur riche (WYSIWYG) pour la création d'articles depuis l'interface journaliste.
2. Brancher les vrais réseaux sociaux dans `Footer.jsx` (liens `#` actuellement).
3. Ajouter les notifications temps réel (WebSocket / Django Channels) pour le bandeau breaking news.
4. Pagination sur `/actualites` (l'API la supporte déjà via DRF).
