import { Routes } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';
import { authGuard } from './core/auth/guards/auth.guard';
import { organizationGuard } from './core/auth/guards/organization.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'authentication/login',
    pathMatch: 'full',
  },
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./modules/auth/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '',
    component: FullComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./modules/dashboard/dashboard.routes').then((m) => m.DashboardRoutes),
      },
      {
        path: 'clinic',
        loadChildren: () =>
          import('./modules/clinic/clinic.routes').then((m) => m.ClinicRoutes),
      },
      {
        path: 'portal/ong',
        canActivate: [organizationGuard(['ong'])],
        loadChildren: () =>
          import('./modules/clinic/clinic.routes').then((m) => m.ClinicRoutes),
      },
      {
        path: 'portal/clinic',
        canActivate: [organizationGuard(['clinic'])],
        loadChildren: () =>
          import('./modules/clinic/clinic.routes').then((m) => m.ClinicRoutes),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];
