import { Routes } from '@angular/router';

export const AlertsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./alerts.component').then((m) => m.AlertsComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./list/alerts-list.component').then((m) => m.AlertsListComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./details/alert-details.component').then((m) => m.AlertDetailsComponent),
      },
    ],
  },
];
