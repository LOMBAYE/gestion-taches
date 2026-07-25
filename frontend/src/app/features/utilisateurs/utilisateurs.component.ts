import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { TaskService } from '../../core/services/task.service';
import { User, Task } from '../../core/models/models';

@Component({
  selector: 'app-utilisateurs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './utilisateurs.component.html',
  styleUrl: './utilisateurs.component.scss',
})
export class UtilisateursComponent implements OnInit {
  private userService = inject(UserService);
  private taskService = inject(TaskService);

  users = signal<User[]>([]);
  tasks = signal<Task[]>([]);
  loading = signal(true);
  search = signal('');
  tab = signal<'users' | 'tasks'>('users');

  filteredUsers = computed(() => {
    const term = this.search().toLowerCase().trim();
    if (!term) return this.users();
    return this.users().filter(
      (u) =>
        `${u.prenom} ${u.nom}`.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
    );
  });

  ngOnInit(): void {
    this.userService.findAll().subscribe((users) => {
      this.users.set(users);
      this.loading.set(false);
    });
    this.taskService.findAll().subscribe((tasks) => this.tasks.set(tasks));
  }

  initials(u: User): string {
    return `${u.prenom[0]}${u.nom[0]}`.toUpperCase();
  }

  roleClass(role: string): string {
    return (
      {
        ADMINISTRATEUR: 'role-admin',
        MANAGER: 'role-manager',
        COLLABORATEUR: 'role-collab',
      }[role] ?? ''
    );
  }

  roleLabel(role: string): string {
    return (
      {
        ADMINISTRATEUR: 'Administrateur',
        MANAGER: 'Manager',
        COLLABORATEUR: 'Collaborateur',
      }[role] ?? role
    );
  }

  statusLabel(statut: string): string {
    return (
      {
        BROUILLON: 'Brouillon',
        SOUMISE: 'Soumise',
        VALIDEE: 'Validée',
        REJETEE: 'Rejetée',
      }[statut] ?? statut
    );
  }
}
