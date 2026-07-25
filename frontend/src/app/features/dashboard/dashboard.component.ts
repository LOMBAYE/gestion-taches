import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { Task } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private taskService = inject(TaskService);
  private userService = inject(UserService);
  auth = inject(AuthService);

  tasks = signal<Task[]>([]);
  userCount = signal<number | null>(null);
  loading = signal(true);

  counts = computed(() => {
    const t = this.tasks();
    return {
      brouillon: t.filter((x) => x.statut === 'BROUILLON').length,
      soumise: t.filter((x) => x.statut === 'SOUMISE').length,
      validee: t.filter((x) => x.statut === 'VALIDEE').length,
      rejetee: t.filter((x) => x.statut === 'REJETEE').length,
      total: t.length,
    };
  });

  recentTasks = computed(() => this.tasks().slice(0, 5));

  ngOnInit(): void {
    this.taskService.findAll().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });

    if (this.auth.hasRole('ADMINISTRATEUR')) {
      this.userService.findAll().subscribe((users) => this.userCount.set(users.length));
    }
  }

  statusLabel(statut: string): string {
    const labels: Record<string, string> = {
      BROUILLON: 'Brouillon',
      SOUMISE: 'Soumise',
      VALIDEE: 'Validée',
      REJETEE: 'Rejetée',
    };
    return labels[statut] ?? statut;
  }
}
