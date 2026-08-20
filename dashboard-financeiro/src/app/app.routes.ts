import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
    {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
   {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./features/auth/login/login')
      .then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/features/dashboard/dashboard')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    loadComponent: () => import('./features/features/transactions/transactions')
      .then(m => m.TransactionsComponent)
  },
  {
    path: 'import',
    canActivate: [authGuard],
    loadComponent: () => import('./features/features/import/import')
      .then(m => m.ImportComponent)
  }
];
