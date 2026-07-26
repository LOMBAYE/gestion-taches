import { Routes } from '@angular/router';
import { authGuard, adminGuard, collaborateurGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/login/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () => import('./shared/layout.component').then((m) => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'taches',
        loadComponent: () =>
          import('./features/tasks/task-list.component').then((m) => m.TaskListComponent),
      },
      {
        path: 'taches/new',
        canActivate: [collaborateurGuard],
        loadComponent: () =>
          import('./features/tasks/task-form.component').then((m) => m.TaskFormComponent),
      },
      {
        path: 'taches/:id/edit',
        canActivate: [collaborateurGuard],
        loadComponent: () =>
          import('./features/tasks/task-form.component').then((m) => m.TaskFormComponent),
      },
      {
        path: 'utilisateurs',
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./features/utilisateurs/utilisateurs.component').then(
            (m) => m.UtilisateursComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
