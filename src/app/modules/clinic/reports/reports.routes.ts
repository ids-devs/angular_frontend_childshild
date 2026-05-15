import { Routes } from '@angular/router';

export const ReportsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./reports.component').then((m) => m.ReportsComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./list/reports-list.component').then((m) => m.ReportsListComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./details/report-details.component').then((m) => m.ReportDetailsComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./details/report-details.component').then((m) => m.ReportDetailsComponent),
      },
    ],
  },
];
