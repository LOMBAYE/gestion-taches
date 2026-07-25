# Gestion de Tâches — Test Technique RH Perspectives

Application de gestion de tâches permettant à des utilisateurs de collaborer autour d'un
processus simple de soumission / validation, avec trois rôles : **Collaborateur**,
**Manager**, **Administrateur**.

## Sommaire

- [Architecture](#architecture)
- [Modèle de données](#modèle-de-données)
- [Rôles et permissions](#rôles-et-permissions)
- [Prérequis](#prérequis)
- [Installation et exécution (Docker, recommandé)](#installation-et-exécution-docker-recommandé)
- [Installation et exécution (sans Docker)](#installation-et-exécution-sans-docker)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Endpoints API](#endpoints-api)
- [Choix techniques](#choix-techniques)

## Architecture

Le projet est un monorepo composé de deux applications indépendantes et d'une base de
données, orchestrées par Docker Compose :

```
task-manager/
├── backend/          # API REST NestJS + Prisma + PostgreSQL
│   ├── src/
│   │   ├── auth/         # Authentification JWT (register/login)
│   │   ├── users/        # Consultation des utilisateurs (Administrateur)
│   │   ├── tasks/         # CRUD + workflow de validation des tâches
│   │   ├── prisma/        # Service Prisma (accès BDD)
│   │   └── common/        # Enums partagés (Role, TaskStatus)
│   ├── prisma/
│   │   ├── schema.prisma  # Modèle de données
│   │   ├── migrations/    # Migration SQL initiale
│   │   └── seed.ts        # Données de démonstration
│   └── Dockerfile
├── frontend/          # Application Angular (standalone components)
│   └── src/app/
│       ├── core/           # Services (Auth, Task, User), guards, intercepteur JWT
│       ├── features/       # Pages : login, register, tasks, admin
│       └── shared/         # Layout commun (navbar)
├── docker-compose.yml
└── README.md
```

**Flux général** : le frontend Angular consomme l'API REST du backend NestJS
(`/api/...`). L'authentification repose sur un JWT stocké côté client et transmis via
un intercepteur HTTP sur chaque requête. Le backend vérifie le token et le rôle de
l'utilisateur (guards NestJS) avant d'autoriser chaque action. Prisma sert de couche
d'accès à PostgreSQL.

## Modèle de données

**Utilisateur**
| Champ | Type |
|---|---|
| nom, prenom | Texte |
| email | Unique |
| password | Hashé (bcrypt) |
| role | COLLABORATEUR / MANAGER / ADMINISTRATEUR |

**Tâche**
| Champ | Type |
|---|---|
| titre, description | Texte |
| statut | BROUILLON / SOUMISE / VALIDEE / REJETEE |
| createur | Référence Utilisateur |
| createdAt, updatedAt | Date |

## Rôles et permissions

| Action | Collaborateur | Manager | Administrateur |
|---|---|---|---|
| Créer / modifier / supprimer une tâche en Brouillon (la sienne) | ✅ | ✅ | ✅ |
| Voir ses propres tâches | ✅ | — | — |
| Soumettre sa tâche pour validation | ✅ | ✅ | ✅ |
| Voir toutes les tâches | ❌ | ✅ | ✅ |
| Valider / rejeter une tâche Soumise | ❌ | ✅ | ✅ |
| Consulter la liste des utilisateurs | ❌ | ❌ | ✅ |

Workflow d'une tâche : `BROUILLON → SOUMISE → VALIDEE` ou `REJETEE`. Une tâche
déjà soumise ne peut plus être modifiée ni supprimée par son créateur.

## Prérequis

- [Docker](https://www.docker.com/) et Docker Compose (méthode recommandée)
- Ou, pour une exécution manuelle : Node.js ≥ 20, npm, PostgreSQL ≥ 14

## Installation et exécution (Docker, recommandé)

Depuis la racine du projet :

```bash
docker compose up --build
```

Cela démarre trois conteneurs :
- `db` : PostgreSQL 16
- `backend` : API NestJS sur `http://localhost:3000/api` (applique automatiquement
  les migrations Prisma et insère les données de démonstration au démarrage)
- `frontend` : application Angular servie par Nginx sur `http://localhost:4200`
  (Nginx redirige les appels `/api` vers le backend)

Une fois les conteneurs démarrés, ouvrir **http://localhost:4200** et se connecter
avec l'un des [comptes de démonstration](#comptes-de-démonstration).

Pour arrêter : `docker compose down` (ajouter `-v` pour supprimer aussi les données
PostgreSQL).

## Installation et exécution (sans Docker)

### Base de données

Créer une base PostgreSQL locale nommée `taskmanager` (ou adapter `DATABASE_URL`).

### Backend

```bash
cd backend
npm install
cp .env.example .env   # adapter DATABASE_URL si besoin
npx prisma migrate deploy
npm run seed            # insère les comptes et tâches de démonstration
npm run start:dev       # démarre l'API sur http://localhost:3000/api
```

### Frontend

```bash
cd frontend
npm install
npm start                # démarre l'application sur http://localhost:4200
```

Le frontend est préconfiguré pour appeler `http://localhost:3000/api` en mode
développement (`src/environments/environment.ts`).

## Comptes de démonstration

Insérés automatiquement par le script de seed (mot de passe identique pour tous) :

| Email | Rôle | Mot de passe |
|---|---|---|
| admin@demo.com | Administrateur | `Password123!` |
| manager@demo.com | Manager | `Password123!` |
| collab@demo.com | Collaborateur | `Password123!` |

Il est également possible de créer un compte via la page d'inscription
(`/register`), en choisissant librement son rôle — pratique pour tester rapidement
les trois profils sans dépendre du seed.

## Endpoints API

Toutes les routes sont préfixées par `/api`.

| Méthode | Route | Accès | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Créer un compte |
| POST | `/auth/login` | Public | Se connecter, obtenir un JWT |
| GET | `/tasks` | Authentifié | Liste des tâches (filtrée selon le rôle) |
| GET | `/tasks/:id` | Authentifié | Détail d'une tâche |
| POST | `/tasks` | Authentifié | Créer une tâche (Brouillon) |
| PATCH | `/tasks/:id` | Propriétaire | Modifier une tâche en Brouillon |
| DELETE | `/tasks/:id` | Propriétaire | Supprimer une tâche en Brouillon |
| PATCH | `/tasks/:id/submit` | Propriétaire | Soumettre pour validation |
| PATCH | `/tasks/:id/validate` | Manager/Admin | Valider une tâche Soumise |
| PATCH | `/tasks/:id/reject` | Manager/Admin | Rejeter une tâche Soumise |
| GET | `/users` | Administrateur | Liste des utilisateurs |
| GET | `/users/:id` | Administrateur | Détail d'un utilisateur |

## Choix techniques

- **NestJS + Prisma** : architecture modulaire (auth/users/tasks), séparation
  claire controller/service, DTOs validés via `class-validator`.
- **Sécurité** : mots de passe hashés avec bcrypt, authentification JWT (Passport),
  autorisation par rôle via un `RolesGuard` + décorateur `@Roles()`, et vérification
  systématique de la propriété d'une ressource (un collaborateur ne peut agir que
  sur ses propres tâches).
- **Angular en standalone components** avec lazy loading par route, un
  `HttpInterceptorFn` pour injecter le JWT sur chaque requête et gérer la
  déconnexion automatique en cas de 401, et des `signal()` pour l'état local.
- **Base de données** : PostgreSQL avec Prisma comme ORM ; migration SQL versionnée
  dans `prisma/migrations`.
- **Docker Compose** orchestre les trois services avec une image de production
  multi-stage (build puis exécution) pour le backend comme pour le frontend
  (Nginx servant les fichiers statiques et proxifiant `/api` vers le backend).

## Pistes d'amélioration (hors périmètre du délai imparti)

- Tests unitaires et end-to-end (Jest côté backend, Cypress/Playwright côté frontend).
- Pagination et filtres sur la liste des tâches.
- Rafraîchissement de token (refresh token) plutôt qu'un JWT à durée fixe.
- Restriction du choix de rôle à l'inscription (actuellement libre pour faciliter la démonstration).
