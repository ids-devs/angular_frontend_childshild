import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

export const organizationGuard = (allowed: Array<'ong' | 'clinic'>): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const userService = inject(UserService);
    const router = inject(Router);

    return authService.check().pipe(
      switchMap((authenticated) => {
        if (!authenticated) {
          router.navigate(['/authentication/login']);
          return of(false);
        }

        const currentUser = userService.user;
        if (currentUser?.organization_type) {
          const allowedHere = allowed.includes(currentUser.organization_type as 'ong' | 'clinic');
          if (!allowedHere) {
            router.navigate(['/dashboard']);
          }
          return of(allowedHere);
        }

        return userService.getCurrentUser().pipe(
          map((user) => {
            const allowedHere = allowed.includes(user.organization_type as 'ong' | 'clinic');
            if (!allowedHere) {
              router.navigate(['/dashboard']);
            }
            return allowedHere;
          })
        );
      })
    );
  };
};
