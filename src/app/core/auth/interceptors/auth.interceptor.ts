import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  // Get the auth token
  const token = authService.accessToken;
  
  // Skip auth header for certain endpoints
  const skipAuthEndpoints = [
    '/v1/auth/login',
    '/v1/auth/register',
    '/v1/auth/forgot-password',
    '/v1/auth/reset-password'
  ];
  
  const shouldSkipAuth = skipAuthEndpoints.some(endpoint => 
    req.url.includes(endpoint)
  );
  
  // Clone the request and add the authorization header if token exists
  if (token && !shouldSkipAuth) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }
  
  return next(req);
};
