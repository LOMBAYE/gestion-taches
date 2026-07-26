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
  tab = signal<'users' | 'tasks'>('users');

  perPageOptions = [5, 10, 20, 50];

  // User pagination state
  userSearch = signal('');
  userCurrentPage = signal<number>(1);
  userItemsPerPage = signal<number>(5);

  // Task pagination state
  taskSearch = signal('');
  taskCurrentPage = signal<number>(1);
  taskItemsPerPage = signal<number>(5);

  // Users Computations
  filteredUsers = computed(() => {
    const term = this.userSearch().toLowerCase().trim();
    if (!term) return this.users();
    return this.users().filter(
      (u) =>
        `${u.prenom} ${u.nom}`.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term),
    );
  });

  userTotalPages = computed(() => {
    const total = this.filteredUsers().length;
    const perPage = this.userItemsPerPage();
    return Math.max(1, Math.ceil(total / perPage));
  });

  paginatedUsers = computed(() => {
    const page = this.userCurrentPage();
    const perPage = this.userItemsPerPage();
    const start = (page - 1) * perPage;
    return this.filteredUsers().slice(start, start + perPage);
  });

  userStartIndex = computed(() => {
    if (this.filteredUsers().length === 0) return 0;
    return (this.userCurrentPage() - 1) * this.userItemsPerPage() + 1;
  });

  userEndIndex = computed(() => {
    const end = this.userCurrentPage() * this.userItemsPerPage();
    return Math.min(end, this.filteredUsers().length);
  });

  userPagesArray = computed(() => {
    const total = this.userTotalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // Tasks Computations
  filteredTasks = computed(() => {
    const term = this.taskSearch().toLowerCase().trim();
    if (!term) return this.tasks();
    return this.tasks().filter(
      (t) =>
        t.titre.toLowerCase().includes(term) ||
        `${t.createur?.prenom} ${t.createur?.nom}`.toLowerCase().includes(term) ||
        t.statut.toLowerCase().includes(term),
    );
  });

  taskTotalPages = computed(() => {
    const total = this.filteredTasks().length;
    const perPage = this.taskItemsPerPage();
    return Math.max(1, Math.ceil(total / perPage));
  });

  paginatedTasks = computed(() => {
    const page = this.taskCurrentPage();
    const perPage = this.taskItemsPerPage();
    const start = (page - 1) * perPage;
    return this.filteredTasks().slice(start, start + perPage);
  });

  taskStartIndex = computed(() => {
    if (this.filteredTasks().length === 0) return 0;
    return (this.taskCurrentPage() - 1) * this.taskItemsPerPage() + 1;
  });

  taskEndIndex = computed(() => {
    const end = this.taskCurrentPage() * this.taskItemsPerPage();
    return Math.min(end, this.filteredTasks().length);
  });

  taskPagesArray = computed(() => {
    const total = this.taskTotalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  // User Handlers
  onUserSearchChange(value: string): void {
    this.userSearch.set(value);
    this.userCurrentPage.set(1);
  }

  onUserPerPageChange(value: number): void {
    this.userItemsPerPage.set(value);
    this.userCurrentPage.set(1);
  }

  goToUserPage(page: number): void {
    if (page >= 1 && page <= this.userTotalPages()) {
      this.userCurrentPage.set(page);
    }
  }

  previousUserPage(): void {
    if (this.userCurrentPage() > 1) {
      this.userCurrentPage.set(this.userCurrentPage() - 1);
    }
  }

  nextUserPage(): void {
    if (this.userCurrentPage() < this.userTotalPages()) {
      this.userCurrentPage.set(this.userCurrentPage() + 1);
    }
  }

  // Task Handlers
  onTaskSearchChange(value: string): void {
    this.taskSearch.set(value);
    this.taskCurrentPage.set(1);
  }

  onTaskPerPageChange(value: number): void {
    this.taskItemsPerPage.set(value);
    this.taskCurrentPage.set(1);
  }

  goToTaskPage(page: number): void {
    if (page >= 1 && page <= this.taskTotalPages()) {
      this.taskCurrentPage.set(page);
    }
  }

  previousTaskPage(): void {
    if (this.taskCurrentPage() > 1) {
      this.taskCurrentPage.set(this.taskCurrentPage() - 1);
    }
  }

  nextTaskPage(): void {
    if (this.taskCurrentPage() < this.taskTotalPages()) {
      this.taskCurrentPage.set(this.taskCurrentPage() + 1);
    }
  }

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
