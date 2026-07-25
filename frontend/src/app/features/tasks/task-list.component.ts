import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { Task, TaskStatus } from '../../core/models/models';

interface Column {
  key: TaskStatus;
  label: string;
}

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.scss',
})
export class TaskListComponent implements OnInit {
  private taskService = inject(TaskService);
  auth = inject(AuthService);

  tasks = signal<Task[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  columns: Column[] = [
    { key: 'BROUILLON', label: 'Brouillon' },
    { key: 'SOUMISE', label: 'Soumise' },
    { key: 'VALIDEE', label: 'Validée' },
    { key: 'REJETEE', label: 'Rejetée' },
  ];

  tasksByStatus = computed(() => {
    const t = this.tasks();
    const map: Record<string, Task[]> = {};
    for (const col of this.columns) {
      map[col.key] = t.filter((x) => x.statut === col.key);
    }
    return map;
  });

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.taskService.findAll().subscribe({
      next: (tasks) => {
        this.tasks.set(tasks);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Impossible de charger les tâches.');
        this.loading.set(false);
      },
    });
  }

  isOwner(task: Task): boolean {
    return task.createurId === this.auth.currentUser()?.id;
  }

  canManage(): boolean {
    return this.auth.hasRole('MANAGER', 'ADMINISTRATEUR');
  }

  submit(task: Task) {
    this.taskService.submit(task.id).subscribe(() => this.load());
  }

  validate(task: Task) {
    this.taskService.validate(task.id).subscribe(() => this.load());
  }

  reject(task: Task) {
    this.taskService.reject(task.id).subscribe(() => this.load());
  }

  remove(task: Task) {
    if (!confirm(`Supprimer la tâche "${task.titre}" ?`)) return;
    this.taskService.remove(task.id).subscribe(() => this.load());
  }
}
