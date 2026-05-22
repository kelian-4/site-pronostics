# ⚽ WinProno (en version beta)

> Plateforme de pronostics sportifs (football & basketball) avec système freemium, panel admin et actualités en temps réel.

![Stack](https://img.shields.io/badge/Vue_3-Composition_API-42b883?style=flat-square&logo=vue.js)
![Stack](https://img.shields.io/badge/Express.js-Node.js-339933?style=flat-square&logo=node.js)
![Stack](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![License](https://img.shields.io/badge/licence-MIT-blue?style=flat-square)

---
## 📸 Aperçu

<img width="1290" height="543" alt="Copie d&#39;écran_20260522_154813" src="https://github.com/user-attachments/assets/e5a356c8-1dee-4a22-8297-cdd75a0d4630" />

<img width="1310" height="673" alt="Copie d&#39;écran_20260522_154846" src="https://github.com/user-attachments/assets/7ae91c5c-1021-4986-960a-afc7e221cef8" />

<img width="1366" height="724" alt="Copie d&#39;écran_20260522_154909" src="https://github.com/user-attachments/assets/163131e7-a4b0-4f7d-a2ee-035cb3fbbb4f" />



| Page | Description |
|------|-------------|
| 🏠 Accueil | Hero, stats, matchs du jour, témoignages |
| 🎯 Pronostics | Cards avec tip, cote, confiance, analyse |
| 📊 Résultats | Historique WON/LOST avec stats globales |
| 🔴 Livescore | Scores en direct avec refresh automatique |
| 📰 Actualités | Flux RSS BBC Sport, Sky Sports, ESPN |
| ⚙️ Admin | Gestion matchs, pronostics, compétitions |

---

## 🛠️ Stack technique

### Frontend
- **Vue 3** (Composition API + `<script setup>`)
- **Vite** — bundler
- **Pinia** — gestion d'état
- **Vue Router** — navigation avec guards
- CSS vanilla — dark mode avec variables CSS

### Backend
- **Express.js** + **Node.js** (ES Modules)
- **PostgreSQL** — base de données relationnelle
- **JWT** — authentification avec rôles (`user` / `admin`)
- **node-fetch** — proxy RSS côté serveur

---

## 📁 Structure du projet

```
pronostics-paris/
├── backend/
│   └── src/
│       ├── db/
│       │   └── pool.js               # Connexion PostgreSQL
│       ├── middleware/
│       │   ├── verifyToken.js        # Vérification JWT
│       │   └── isAdmin.js            # Guard admin
│       ├── routes/
│       │   ├── auth.js               # Register / Login / Me
│       │   ├── matches.js            # CRUD matchs + live
│       │   ├── predictions.js        # Pronostics freemium
│       │   ├── admin.js              # Panel admin complet
│       │   ├── news.js               # Proxy flux RSS
│       │   └── competitions.js       # Compétitions
│       ├── services/
│       │   └── football-api.js       # Wrapper API-Football
│       └── index.js                  # Point d'entrée Express
│
└── frontend/
    └── src/
        ├── views/
        │   ├── Home.vue
        │   ├── Login.vue
        │   ├── Register.vue
        │   ├── Predictions.vue
        │   ├── MatchDetail.vue
        │   ├── Livescore.vue
        │   ├── Results.vue
        │   ├── News.vue
        │   └── Admin.vue
        ├── stores/
        │   ├── auth.js
        │   ├── matches.js
        │   └── predictions.js
        ├── router/
        │   └── index.js
        ├── App.vue
        └── main.js
```

---

## ⚙️ Installation

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- npm

> **NixOS** : le projet utilise `node --watch` au lieu de `nodemon` et un shell `fish`.

---

### 1. Cloner le projet

```bash
git clone https://github.com/ton-username/pronostics-paris.git
cd pronostics-paris
```

### 2. Base de données

```bash
# Créer la base et l'utilisateur
psql -h localhost -U postgres
```

```sql
CREATE USER pronostics_user WITH PASSWORD 'ton_mot_de_passe';
CREATE DATABASE pronostics_db OWNER pronostics_user;
\q
```

```bash
# Appliquer le schéma
psql -h localhost -U pronostics_user -d pronostics_db -f schema.sql
```

#### Schéma des tables

```sql
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username     VARCHAR(50) UNIQUE NOT NULL,
  email        VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  balance      DECIMAL(10,2) DEFAULT 0,
  role         VARCHAR(20) DEFAULT 'user',
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE competitions (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id   INTEGER,
  name     VARCHAR(100) NOT NULL,
  country  VARCHAR(100),
  logo_url TEXT,
  sport    VARCHAR(20) DEFAULT 'football'
);

CREATE TABLE matches (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_id         INTEGER UNIQUE,
  competition_id UUID REFERENCES competitions(id),
  home_team      VARCHAR(100) NOT NULL,
  home_logo      TEXT,
  away_team      VARCHAR(100) NOT NULL,
  away_logo      TEXT,
  match_date     TIMESTAMP NOT NULL,
  status         VARCHAR(20) DEFAULT 'UPCOMING',
  home_score     INTEGER,
  away_score     INTEGER,
  sport          VARCHAR(20) DEFAULT 'football'
);

CREATE TABLE predictions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id     UUID REFERENCES matches(id) ON DELETE CASCADE,
  tip          VARCHAR(200) NOT NULL,
  odds         DECIMAL(5,2),
  confidence   INTEGER DEFAULT 50,
  analysis     TEXT,
  is_premium   BOOLEAN DEFAULT false,
  result       VARCHAR(10),
  market       VARCHAR(50) DEFAULT '1X2',
  published_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE match_stats (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  team     VARCHAR(100),
  label    VARCHAR(100),
  value    VARCHAR(50),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE team_form (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  team     VARCHAR(100),
  results  VARCHAR(20),
  ppg      DECIMAL(4,2),
  rank     INTEGER,
  points   INTEGER
);

CREATE TABLE subscriptions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  plan       VARCHAR(20),
  expires_at TIMESTAMP
);
```

### 3. Backend

```bash
cd backend
npm install
```

Crée le fichier `.env` :

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pronostics_db
DB_USER=pronostics_user
DB_PASSWORD=ton_mot_de_passe
JWT_SECRET=une_cle_secrete_longue_et_aleatoire
API_FOOTBALL_KEY=ta_cle_api_football
```

```bash
npm run dev
# node --watch src/index.js
```

### 4. Frontend

```bash
cd frontend
npm install
```

Crée le fichier `.env` :

```env
VITE_API_URL=http://localhost:3000
```

```bash
npm run dev
# Vite sur http://localhost:5173
```

---

## 👤 Créer un compte admin

```bash
# 1. S'inscrire via l'interface ou l'API
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@winprono.fr","password":"motdepasse"}'

# 2. Passer le compte en admin dans la BDD
psql -h localhost -U pronostics_user -d pronostics_db \
  -c "UPDATE users SET role = 'admin' WHERE username = 'admin';"
```

Se connecter avec ce compte — le lien **⚙️ Admin** apparaît dans la navbar.

---

## 🔑 API Endpoints

### Auth
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/register` | Inscription |
| POST | `/auth/login` | Connexion → JWT |
| GET | `/auth/me` | Profil connecté |

### Matchs
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/matches` | Liste avec stats et forme |
| GET | `/matches/:id` | Détail + pronostics |
| GET | `/matches/live` | Scores en direct |

### Pronostics
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/predictions` | Liste (freemium selon abonnement) |
| GET | `/predictions/stats` | Statistiques globales |

### Admin (role admin requis)
| Méthode | Route | Description |
|---------|-------|-------------|
| GET/POST | `/admin/matches` | Lister / Ajouter un match |
| PATCH/DELETE | `/admin/matches/:id` | Modifier / Supprimer |
| GET/POST | `/admin/predictions` | Lister / Publier un pronostic |
| PATCH/DELETE | `/admin/predictions/:id` | Modifier / Supprimer |
| PATCH | `/admin/predictions/:id/result` | Mettre à jour WON/LOST |
| GET/POST | `/admin/competitions` | Lister / Ajouter une compétition |
| DELETE | `/admin/competitions/:id` | Supprimer |

### News
| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/news?source=bbc` | Proxy RSS (`bbc`, `sky`, `espn`, `nba`) |

---

## 🎨 Design system

```css
--bg:         #0f1923   /* Fond principal */
--surface:    #1a2634   /* Cards, panels */
--accent:     #00dc82   /* Vert — actions, succès */
--danger:     #ff4757   /* Rouge — erreurs, LOST */
--warning:    #ffa502   /* Orange — en attente */
--border:     #2d3f55   /* Bordures */
```

Dark mode exclusif, CSS vanilla, aucun framework CSS.

---

## 📋 Fonctionnalités

- [x] Authentification JWT avec rôles (user / admin)
- [x] Pronostics freemium selon abonnement
- [x] Panel admin — gestion matchs, pronostics, compétitions
- [x] Livescore avec refresh automatique toutes les 30s
- [x] Actualités RSS (BBC Sport, Sky Sports, ESPN FC, NBA)
- [x] Historique des résultats WON/LOST
- [x] Détail match avec statistiques et forme des équipes
- [x] Design dark mode responsive
- [ ] Intégration IA pour génération automatique d'analyses
- [ ] Page admin — mise à jour scores en temps réel
- [ ] Notifications push pour les matchs live

---

## ⚠️ Notes importantes

- **API-Football** : le plan gratuit est limité aux saisons 2022-2024. Les matchs sont donc insérés manuellement via le panel admin.
- **NixOS** : utilise `node --watch` au lieu de `nodemon`. Le DNS externe peut nécessiter `networking.nameservers = [ "8.8.8.8" "1.1.1.1" ]` dans `configuration.nix`.
- **Flux RSS** : le fetch est proxifié via le backend Express pour éviter les blocages CORS.

---

## 📄 Licence

MIT — libre d'utilisation, de modification et de distribution.

---

<p align="center">Fait avec ☕ et beaucoup de pronostics ratés</p>
