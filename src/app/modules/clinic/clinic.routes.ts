import { Routes } from '@angular/router';

export const ClinicRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./clinic.component').then((m) => m.ClinicComponent),
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full',
      },
      {
        path: 'overview',
        loadChildren: () => import('./overview/overview.routes').then((m) => m.OverviewRoutes),
      },
      {
        path: 'alerts',
        loadChildren: () => import('./alerts/alerts.routes').then((m) => m.AlertsRoutes),
      },
      {
        path: 'families',
        loadChildren: () => import('./families/families.routes').then((m) => m.FamiliesRoutes),
      },
      {
        path: 'campaigns',
        loadChildren: () => import('./campaigns/campaigns.routes').then((m) => m.CampaignsRoutes),
      },
      {
        path: 'reports',
        loadChildren: () => import('./reports/reports.routes').then((m) => m.ReportsRoutes),
      },
      {
        path: 'symptom-reports',
        loadChildren: () => import('./symptom-reports/symptom-reports.routes').then((m) => m.SymptomReportsRoutes),
      },
    ],
  },
];
