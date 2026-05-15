import { Routes } from '@angular/router';

export const DashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard.component').then((m) => m.DashboardComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./list/dashboard-list.component').then((m) => m.DashboardListComponent),
      },
      {
        path: 'details/:id',
        loadComponent: () => import('./details/dashboard-details.component').then((m) => m.DashboardDetailsComponent),
      },
    ],
  },
];
