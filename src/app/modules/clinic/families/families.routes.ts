import { Routes } from '@angular/router';

export const FamiliesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./families.component').then((m) => m.FamiliesComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./list/families-list.component').then((m) => m.FamiliesListComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./details/family-details.component').then((m) => m.FamilyDetailsComponent),
      },
    ],
  },
];
