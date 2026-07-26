import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  initials(): string {
    const u = this.auth.currentUser();
    if (!u) return '?';
    const p = u.prenom ? u.prenom[0] : '';
    const n = u.nom ? u.nom[0] : '';
    return (`${p}${n}`.toUpperCase()) || '?';
  }

  roleLabel(): string {
    const roles: Record<string, string> = {
      COLLABORATEUR: 'COLLABORATEUR',
      MANAGER: 'MANAGER',
      ADMINISTRATEUR: 'ADMINISTRATEUR',
    };
    return roles[this.auth.currentUser()?.role ?? ''] ?? '';
  }
}
