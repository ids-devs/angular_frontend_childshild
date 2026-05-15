import { Routes } from '@angular/router';

export const SymptomReportsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./symptom-reports.component').then((m) => m.SymptomReportsComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./list/symptom-reports-list.component').then((m) => m.SymptomReportsListComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./details/symptom-report-details.component').then((m) => m.SymptomReportDetailsComponent),
      },
    ],
  },
];
