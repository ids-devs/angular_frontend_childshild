import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  return authService.check().pipe(
    switchMap(authenticated => {
      if (authenticated) {
        const orgType = userService.user?.organization_type;
        if (orgType === 'ong') router.navigate(['/portal/ong']);
        else if (orgType === 'clinic') router.navigate(['/portal/clinic']);
        else router.navigate(['/dashboard']);
        return of(false);
      }

      return of(true);
    })
  );
};
