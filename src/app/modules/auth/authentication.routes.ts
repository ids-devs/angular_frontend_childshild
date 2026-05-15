import { Routes } from '@angular/router';
import { AppSideLoginComponent } from './side-login/side-login.component';
import { AppSideRegisterComponent } from './side-register/side-register.component';
import { noAuthGuard } from 'src/app/core/auth/guards/no-auth.guard';

export const AuthenticationRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'login',
        component: AppSideLoginComponent,
        canActivate: [noAuthGuard],
      },
      {
        path: 'register',
        component: AppSideRegisterComponent,
        canActivate: [noAuthGuard],
      },
    ],
  },
];
