import { Routes } from '@angular/router';

export const CampaignsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./campaigns.component').then((m) => m.CampaignsComponent),
    children: [
      {
        path: '',
        loadComponent: () => import('./list/campaigns-list.component').then((m) => m.CampaignsListComponent),
      },
      {
        path: 'new',
        loadComponent: () => import('./details/campaign-form.component').then((m) => m.CampaignFormComponent),
      },
      {
        path: ':id',
        loadComponent: () => import('./details/campaign-form.component').then((m) => m.CampaignFormComponent),
      },
    ],
  },
];
