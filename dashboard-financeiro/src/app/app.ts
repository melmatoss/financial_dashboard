import { Component, inject, signal } from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from './core/services/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class AppComponent {
  authService = inject(AuthService);
    private router = inject(Router);

  isSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  async onLogout(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/login']);

  }
}