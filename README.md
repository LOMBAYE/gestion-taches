# Gestion de Tâches — Test Technique RH Perspectives

Application de gestion de tâches permettant à des utilisateurs de collaborer autour d'un
processus simple de soumission / validation, avec trois rôles : **Collaborateur**,
**Manager**, **Administrateur**.

---

## Sommaire

- [Architecture](#architecture)
- [Stack technique](#stack-technique)
- [Modèle de données](#modèle-de-données)
- [Rôles et permissions](#rôles-et-permissions)
- [Prérequis](#prérequis)
- [Installation et exécution (Docker, recommandé)](#installation-et-exécution-docker-recommandé)
- [Installation et exécution (sans Docker)](#installation-et-exécution-sans-docker)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Endpoints API](#endpoints-api)
- [Choix techniques](#choix-techniques)
---

## Architecture

Le projet est un monorepo composé de deux applications (Backend NestJS et Frontend Angular) et d'une base de données PostgreSQL, orchestrées via Docker Compose.

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | Angular 19 (standalone components), Bootstrap |
| Backend | NestJS, Prisma ORM |
| Base de données | PostgreSQL 16 |
| Authentification | JWT (passport-jwt) + bcrypt |
| Conteneurisation | Docker Compose (3 services : db, backend, frontend/nginx) |

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
└── README.md
```

**Flux général** : 

 Le frontend Angular consomme l'API REST exposée par le backend NestJS.
- L'authentification repose sur un token JWT transmis via le header `Authorization: Bearer <token>`, ajouté automatiquement par un intercepteur HTTP.
- Le backend vérifie l'identité via `JwtAuthGuard` et les rôles via `RolesGuard` sur chaque route protégée.
- Prisma sert de couche d'accès à PostgreSQL.
- En Docker, nginx sert les fichiers statiques Angular et proxifie les appels `/api/` vers le backend interne.

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

## Rôles et permissions

| Action | Collaborateur | Manager | Administrateur | Implémentation |
|---|---|---|---|---|
| Créer une tâche (`POST /taches`) | ✅ | ❌ | ❌ | Restreint au rôle `COLLABORATEUR` |
| Consulter la liste des tâches (`GET /taches`) | ✅ (ses tâches) | ✅ (tâches soumises) | ✅ (toutes) | Filtré selon le rôle dans `TachesService` |
| Détail d'une tâche (`GET /taches/:id`) | ✅ | ✅ | ✅ | Nécessite un token JWT valide |
| Modifier une tâche (`PATCH /taches/:id`) | ✅ (Brouillon uniquement) | ❌ | ❌ | Réservé au créateur |
| Supprimer une tâche (`DELETE /taches/:id`) | ✅ (Brouillon uniquement) | ❌ | ❌ | Réservé au créateur |
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

## Endpoints API

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
| PATCH | `/taches/:id` | Créateur | Modifier le titre / la description d'une tâche en Brouillon |
| DELETE | `/taches/:id` | Créateur | Supprimer une tâche en Brouillon |
| PATCH | `/taches/:id/soumettre` | Collaborateur | Passer le statut à `SOUMISE` |
| PATCH | `/taches/:id/valider` | Manager | Passer le statut à `VALIDEE` |
| PATCH | `/taches/:id/rejeter` | Manager | Passer le statut à `REJETEE` |

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

**Page Login**
![alt text](image-2.png)

**Dashboard (vue admin)**

![alt text](image-1.png)

**Gestion taches(vue colloborateur)**

![alt text](image-3.png)
