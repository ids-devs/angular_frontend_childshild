import { Routes } from '@angular/router';

export const OverviewRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./overview.component').then((m) => m.OverviewComponent),
  },
];
