export type Role = 'COLLABORATEUR' | 'MANAGER' | 'ADMINISTRATEUR';
export type TaskStatus = 'BROUILLON' | 'SOUMISE' | 'VALIDEE' | 'REJETEE';

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Task {
  id: string;
  titre: string;
  description: string;
  statut: TaskStatus;
  createdAt: string;
  updatedAt: string;
  createurId: string;
  createur?: { id: string; nom: string; prenom: string; email: string };
}

export interface AuthResponse {
  access_token: string;
  utilisateur: User;
}
