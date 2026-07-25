import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../../core/services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  form = this.fb.group({
    titre: ['', Validators.required],
    description: ['', Validators.required],
  });

  taskId = signal<string | null>(null);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskId.set(id);
      this.taskService.findOne(id).subscribe((task) => {
        this.form.patchValue({ titre: task.titre, description: task.description });
      });
    }
  }

  cancel() {
    this.router.navigate(['/taches']);
  }

  submit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.errorMessage.set(null);
    const payload = this.form.getRawValue() as { titre: string; description: string };

    const request$ = this.taskId()
      ? this.taskService.update(this.taskId()!, payload)
      : this.taskService.create(payload);

    request$.subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/taches']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message || 'Une erreur est survenue.');
      },
    });
  }
}
