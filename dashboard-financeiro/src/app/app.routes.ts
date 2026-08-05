import { Routes } from '@angular/router';

export const routes: Routes = [
    {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/features/dashboard/dashboard')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'transactions',
    loadComponent: () => import('./features/features/transactions/transactions')
      .then(m => m.TransactionsComponent)
  },
  {
    path: 'import',
    loadComponent: () => import('./features/features/import/import')
      .then(m => m.ImportComponent)
  }
];
