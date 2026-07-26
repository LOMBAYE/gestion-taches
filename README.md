# Gestion de Tâches — README2 (Version Réalignée avec le Code Source)

Ce document réaligne la documentation avec l'état réel et exact de l'implémentation du projet **Gestion de Tâches**.

---

## Sommaire

- [Architecture](#architecture)
- [Modèle de données](#modèle-de-données)
- [Rôles et permissions (État actuel)](#rôles-et-permissions-état-actuel)
- [Prérequis](#prérequis)
- [Installation et exécution (Docker, recommandé)](#installation-et-exécution-docker-recommandé)
- [Installation et exécution (sans Docker)](#installation-et-exécution-sans-docker)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Endpoints API (Routes Réelles)](#endpoints-api-routes-réelles)
- [Choix techniques](#choix-techniques)
- [Synthèse des écarts et pistes d'alignement](#synthèse-des-écarts-et-pistes-dalignement)

---

## Architecture

Le projet est un monorepo composé de deux applications (Backend NestJS et Frontend Angular) et d'une base de données PostgreSQL, orchestrées via Docker Compose.

```
gestion-taches/
├── backend/                  # API REST NestJS + Prisma + PostgreSQL
│   ├── src/
│   │   ├── auth/             # Authentification JWT (register/login, guards, decorators)
│   │   ├── utilisateurs/     # Service et contrôleur de gestion des utilisateurs
│   │   ├── taches/           # Service et contrôleur du workflow des tâches
│   │   ├── prisma/           # PrismaService (connexion BDD)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma     # Schéma de la base de données
│   │   ├── migrations/       # Migrations PostgreSQL
│   │   └── seed.ts           # Script d'initialisation des données de démo
│   ├── docker-entrypoint.sh  # Script de démarrage Docker (migrate deploy)
│   └── Dockerfile
├── frontend/                 # Application Angular (standalone components)
│   └── src/app/
│       ├── core/             # Auth/Task/User Services, guards, interceptor JWT, models
│       ├── features/         # Pages : login, register, dashboard, tasks, utilisateurs
│       └── shared/           # Layout et composants partagés (navbar, footer)
├── docker-compose.yml
├── README.md                 # Spécification initiale
```

**Flux général** : 
- Le frontend Angular consomme l'API REST exposée par le backend NestJS.
- L'authentification repose sur un token JWT transmis via le header `Authorization: Bearer <token>` par le `jwtInterceptor`.
- Le backend vérifie l'identité via `JwtAuthGuard` et les rôles via `RolesGuard`.
- Prisma interagit avec PostgreSQL.

---

## Modèle de données

### Utilisateur (`Utilisateur`)
| Champ | Type Prisma | Description |
|---|---|---|
| `id` | `String` (UUID) | Identifiant unique |
| `nom` | `String` | Nom de famille |
| `prenom` | `String` | Prénom |
| `email` | `String` (Unique) | Adresse e-mail (login) |
| `password` | `String` | Mot de passe hashé (bcrypt) |
| `role` | `Role` (Enum) | `COLLABORATEUR`, `MANAGER`, `ADMINISTRATEUR` |

### Tâche (`Tache`)
| Champ | Type Prisma | Description |
|---|---|---|
| `id` | `String` (UUID) | Identifiant unique |
| `titre` | `String` | Intitulé de la tâche |
| `description` | `String` | Contenu détaillé |
| `statut` | `Statut` (Enum) | `BROUILLON`, `SOUMISE`, `VALIDEE`, `REJETEE` |
| `dateCreation` | `DateTime` | Date et heure de création (`now()`) |
| `derniereModification` | `DateTime` | Date et heure de dernière mise à jour (`@updatedAt`) |
| `createurId` | `String` (FK) | Référence vers l'utilisateur créateur |

---

## Rôles et permissions (État actuel du code)

Dans la version actuelle du code (`taches.controller.ts` & `taches.service.ts`), les règles de sécurité s'appliquent comme suit :

| Action | Collaborateur | Manager | Administrateur | Note / Implémentation |
|---|---|---|---|---|
| Créer une tâche (`POST /taches`) | ✅ | ❌ | ❌ | Restreint au rôle `COLLABORATEUR` |
| Consulter la liste des tâches (`GET /taches`) | ✅ (ses tâches) | ✅ (tâches soumises) | ✅ (toutes) | Filtré selon le rôle dans `TachesService` |
| Détail d'une tâche (`GET /taches/:id`) | ✅ | ✅ | ✅ | Nécessite un token JWT valide |
| Modifier une tâche (`PATCH /taches/:id`) | ✅ | ❌ | ❌ | Nécessite un token JWT valide |
| Soumettre une tâche (`PATCH /taches/:id/soumettre`) | ✅ | ❌ | ❌ | Restreint au rôle `COLLABORATEUR` |
| Valider une tâche (`PATCH /taches/:id/valider`) | ❌ | ✅ | ❌ | Restreint au rôle `MANAGER` |
| Rejeter une tâche (`PATCH /taches/:id/rejeter`) | ❌ | ✅ | ❌ | Restreint au rôle `MANAGER` |
| Consulter la liste des utilisateurs (`GET /utilisateurs`) | ❌ | ❌ | ✅ | Restreint au rôle `ADMINISTRATEUR` |

---

## Prérequis

- [Docker](https://www.docker.com/) et Docker Compose (méthode recommandée)
- Pour une exécution manuelle : Node.js ≥ 20, npm, PostgreSQL ≥ 14

---

## Installation et exécution (Docker, recommandé)

Depuis la racine du projet :

```bash
docker compose up --build
```

Services démarrés :
- `db` : PostgreSQL 16 (port local `5433`)
- `backend` : API NestJS sur le port `3000` (exécute les migrations `npx prisma migrate deploy`)
- `frontend` : Application Angular servie via Nginx sur `http://localhost:4200` (proxyfication des requêtes `/api/` vers `http://backend:3000/`)

Pour réinitialiser ou charger les données de démo dans le conteneur backend :
```bash
docker compose exec backend npx ts-node prisma/seed.ts
```

Pour tout arrêter : `docker compose down -v`

---

## Installation et exécution (sans Docker)

### 1. Base de données
Créer une base PostgreSQL nommée `gestion_taches` (ou configurer votre URL dans `.env`).

### 2. Backend
```bash
cd backend
npm install
# S'assurer que .env contient :
# DATABASE_URL="postgresql://postgres:votre_pass@localhost:5432/gestion_taches?schema=public"
# JWT_SECRET="votre-secret"

npx prisma migrate deploy
npx ts-node prisma/seed.ts   # Données de démonstration
npm run start:dev            # Démarre sur http://localhost:3000
```

### 3. Frontend
```bash
cd frontend
npm install
npm start                    # Démarre sur http://localhost:4200
```

---

## Comptes de démonstration

Inscrits via le script de seed `prisma/seed.ts` (mot de passe identique : `Password123!`) :

| Email | Prénom Nom | Rôle | Mot de passe |
|---|---|---|---|
| `admin@demo.com` | Awa Diop | Administrateur | `Password123!` |
| `manager@demo.com` | Moussa Ndiaye | Manager | `Password123!` |
| `collab@demo.com` | Fatou Fall | Collaborateur | `Password123!` |

---

## Endpoints API (Routes Réelles)

### Authentification (`/auth`)
| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Inscription utilisateur (choix du rôle libre) |
| POST | `/auth/login` | Public | Connexion utilisateur (retourne le token JWT) |

### Tâches (`/taches`)
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/taches` | Authentifié | Liste des tâches (Collaborateur = ses tâches, Manager = SOUMISE, Admin = toutes) |
| GET | `/taches/:id` | Authentifié | Consulter le détail d'une tâche |
| POST | `/taches` | Collaborateur | Créer une tâche (titre, description) |
| PATCH | `/taches/:id` | Authentifié | Modifier le titre / la description d'une tâche |
| PATCH | `/taches/:id/soumettre` | Collaborateur | Passer le statut à `SOUMISE` |
| PATCH | `/taches/:id/valider` | Manager | Passer le statut à `VALIDEE` |

### Utilisateurs (`/utilisateurs`)
| Méthode | Route | Accès | Description |
|---|---|---|---|
| GET | `/utilisateurs` | Administrateur | Obtenir la liste complète des utilisateurs |

---

## Choix techniques

- **NestJS & Prisma** : Séparation modulaire (auth, utilisateurs, taches), validation des payloads avec `class-validator`, ORM Prisma pour le typage fort et les migrations versionnées.
- **Authentification & Sécurité** : Hashage des mots de passe avec `bcrypt`, authentification par token `JWT` via `@nestjs/jwt` et `passport-jwt`, gardes d'accès `RolesGuard`.
- **Angular 19** : Application utilisant des *standalone components*, `Signals` d'Angular pour la gestion réactive de l'état local, lazy loading des routes, et `HttpInterceptorFn` pour ajouter l'en-tête de bearer token.
- **Docker Compose** : Orchestration multi-conteneurs (PostgreSQL + NestJS + Angular/Nginx).

---

## Synthèse des écarts et pistes d'alignement

Pour faire évoluer le code afin de correspondre à 100% à la spécification fonctionnelle initiale ([README.md](file:///Users/user/Documents/gestion-taches/README.md)) :

1. **Préfixe API Global (`/api`)** :
   - Ajouter `app.setGlobalPrefix('api');` dans `backend/src/main.ts`.
   - Ajuster `environment.ts` du frontend avec `apiUrl: 'http://localhost:3000/api'`.
   - Mettre à jour `frontend/nginx.conf` (`proxy_pass http://backend:3000;` sans le `/` final qui supprime le préfixe).

2. **Endpoints manquants à ajouter dans `TachesController`** :
   - `DELETE /taches/:id` : Pour permettre la suppression d'une tâche par son créateur.
   - `PATCH /taches/:id/rejeter` : Pour permettre à un Manager ou Administrateur de rejeter une tâche.
   - `GET /utilisateurs/:id` : Pour la consultation individuelle d'un utilisateur par un Admin.

3. **Alignement des Rôles & Décorateurs** :
   - Autoriser `MANAGER` et `ADMINISTRATEUR` dans le décorateur `@Roles()` sur les routes de création/soumission si ceux-ci doivent pouvoir créer leurs propres tâches.
   - Autoriser `ADMINISTRATEUR` sur la route de validation (`valider`).
   - Permettre au `MANAGER` de consulter l'ensemble des tâches dans `TachesService.findAll()`.

4. **Vérification du statut et du propriétaire dans le workflow** :
   - Ajouter un contrôle dans `update()`, `soumettre()` et `remove()` pour vérifier que la tâche appartient à l'utilisateur (`createurId === userId`) et que son statut est `BROUILLON`.

5. **Nommage des champs de date** :
   - Remplacer `dateCreation` et `derniereModification` par `createdAt` et `updatedAt` dans `schema.prisma` (ou mapper ces données dans le DTO / service).

6. **Script `package.json`** :
   - Ajouter le script `"seed": "ts-node prisma/seed.ts"` dans `backend/package.json`.
   - Ajouter l'exécution automatique du seed dans `docker-entrypoint.sh`.
