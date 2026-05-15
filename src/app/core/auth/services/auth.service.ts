import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

import { ConfigService } from '../../services/config.service';
import { LoggingService } from '../../services/logging.service';
import { UserService } from './user.service';

import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  FintraAuthResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RefreshTokenResponse,
  TokenPayload
} from '../models/auth.types';
import { User } from '../models/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _authenticated = new BehaviorSubject<boolean>(false);
  private _mustChangePassword = new BehaviorSubject<boolean>(false);
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_BUFFER = 5 * 60 * 1000; // 5 minutes before expiry

  constructor(
    private httpClient: HttpClient,
    private configService: ConfigService,
    private logger: LoggingService,
    private userService: UserService,
    private router: Router
  ) {
    this.initializeAuth();
  }

  // Observables
  get authenticated$(): Observable<boolean> {
    return this._authenticated.asObservable();
  }

  get mustChangePassword$(): Observable<boolean> {
    return this._mustChangePassword.asObservable();
  }

  get isAuthenticated(): boolean {
    return this._authenticated.value;
  }

  // Token management
  get accessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private set accessToken(token: string | null) {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  // Initialize authentication state
  private initializeAuth(): void {
    const token = this.accessToken;
    if (token && !this.isTokenExpired(token)) {
      this._authenticated.next(true);
      this.setupTokenRefresh(token);
    } else {
      // Clear authentication state without navigating
      this.accessToken = null;
      this._authenticated.next(false);
      this._mustChangePassword.next(false);
      this.userService.clearUser();
    }
  }

  // Authentication methods
  signIn(credentials: LoginCredentials): Observable<AuthResponse | FintraAuthResponse> {
    if (this._authenticated.value) {
      return throwError(() => new Error('User is already authenticated'));
    }

    return this.httpClient.post<AuthResponse | FintraAuthResponse>(
      this.configService.getApiUrl('v1/auth/login'),
      credentials
    ).pipe(
      tap(response => {
        const r = response as any;

        // Unwrap nested { data: { access_token, ... }, message } format (IOPS backend)
        // or Fintra-style { success: true, data: { ... } } format
        const data = r.data?.access_token ? r.data : r;

        const authResponse: AuthResponse = {
          access_token: data.access_token,
          token_type:   data.token_type || 'bearer',
          expires_in:   data.expires_in,
          user:         data.user,
          current_tenant: data.current_tenant,
          current_role: data.current_role,
          must_change:  data.must_change || false,
        };
        this.handleAuthSuccess(authResponse);
      }),
      catchError(error => {
        this.logger.error('Sign in failed', error);
        return throwError(() => error);
      })
    );
  }

  signUp(userData: RegisterData): Observable<AuthResponse | FintraAuthResponse> {
    return this.httpClient.post<AuthResponse | FintraAuthResponse>(
      this.configService.getApiUrl('v1/auth/register'),
      userData
    ).pipe(
      tap(response => {
        // Handle fintra-style response structure
        if ('success' in response && response.success && 'data' in response && response.data) {
          const authResponse: AuthResponse = {
            access_token: response.data.access_token,
            token_type: response.data.token_type || 'bearer',
            expires_in: response.data.expires_in,
            user: response.data.user,
            current_tenant: response.data.current_tenant || response.data.tenant,
            must_change: response.data.must_change || false
          };
          this.handleAuthSuccess(authResponse);
        } else {
          // Fallback for backward compatibility
          this.handleAuthSuccess(response as AuthResponse);
        }
      }),
      catchError(error => {
        this.logger.error('Sign up failed', error);
        return throwError(() => error);
      })
    );
  }

  signOut(): Observable<any> {
    // Clear local state immediately for better UX
    this.handleSignOut();

    // Try to call the API, but don't block on it
    return this.httpClient.post(
      this.configService.getApiUrl('v1/auth/logout'),
      {}
    ).pipe(
      catchError(() => {
        // Continue even if logout API fails
        return of({ success: true, message: 'Logged out locally' });
      }),
      map((response: any) => {
        // Handle fintra-style response
        if (response.success !== undefined) {
          return response;
        }
        return { success: true, message: 'Logged out successfully' };
      })
    );
  }

  // Token validation and refresh
  check(): Observable<boolean> {
    if (this._authenticated.value) {
      return of(true);
    }

    const token = this.accessToken;
    if (!token) {
      return of(false);
    }

    if (this.isTokenExpired(token)) {
      this.signOut();
      return of(false);
    }

    // Verify token with backend
    return this.refreshToken().pipe(
      map(() => true),
      catchError(() => {
        this.signOut();
        return of(false);
      })
    );
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    return this.httpClient.post<RefreshTokenResponse>(
      this.configService.getApiUrl('v1/auth/refresh'),
      {}
    ).pipe(
      tap(response => {
        const payload: any = (response as any).data?.access_token ? (response as any).data : response;
        this.accessToken = payload.access_token;
        this.setupTokenRefresh(payload.access_token);
        this.logger.info('Token refreshed successfully');
      }),
      catchError(error => {
        this.logger.error('Token refresh failed', error);
        this.signOut();
        return throwError(() => error);
      })
    );
  }

  // Password management
  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    return this.httpClient.post(
      this.configService.getApiUrl('auth/reset-password'),
      request
    ).pipe(
      tap(() => {
      }),
      catchError(error => {
        this.logger.error('Forgot password failed', error);
        return throwError(() => error);
      })
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.httpClient.post(
      this.configService.getApiUrl('auth/reset-password'),
      request
    ).pipe(
      tap(() => {
      }),
      catchError(error => {
        this.logger.error('Reset password failed', error);
        return throwError(() => error);
      })
    );
  }

  changePassword(request: ChangePasswordRequest): Observable<any> {
    return this.httpClient.post(
      this.configService.getApiUrl('auth/change-password'),
      request
    ).pipe(
      tap(() => {
      }),
      catchError(error => {
        this.logger.error('Change password failed', error);
        return throwError(() => error);
      })
    );
  }

  // Invitation validation methods
  validateInvitation(token: string): Observable<any> {
    return this.httpClient.get(
      this.configService.getApiUrl(`auth/validate-invitation?token=${token}`)
    ).pipe(
      catchError(error => {
        this.logger.error('Invitation validation failed', error);
        return throwError(() => error);
      })
    );
  }

  validateCompany(companyName: string): Observable<any> {
    return this.httpClient.get(
      this.configService.getApiUrl(`auth/validate-company?company_name=${encodeURIComponent(companyName)}`)
    ).pipe(
      catchError(error => {
        this.logger.error('Company validation failed', error);
        return throwError(() => error);
      })
    );
  }

  // Private helper methods
  private handleAuthSuccess(response: AuthResponse): void {
    this.accessToken = response.access_token;
    this._authenticated.next(true);
    this._mustChangePassword.next(response.must_change || false);

    // Store user data, attaching current_role so isDonor() works immediately
    this.userService.setUser(response.user, response.current_role);

    // Store tenant data if available
    if (response.current_tenant) {
      this.userService.setCurrentTenant(response.current_tenant);
    }

    // Setup token refresh
    this.setupTokenRefresh(response.access_token);

    // Redirect donor users to their portal instead of the admin dashboard
    const orgType = (response.user as any)?.organization_type;
    if (orgType === 'ong') this.router.navigate(['/portal/ong']);
    else if (orgType === 'clinic') this.router.navigate(['/portal/clinic']);
    else this.router.navigate(['/dashboard']);

    this.logger.info('Authentication successful');
  }

  private handleSignOut(): void {
    this.accessToken = null;
    this._authenticated.next(false);
    this._mustChangePassword.next(false);
    this.userService.clearUser();
    // Don't navigate automatically - let the guards handle navigation
    this.logger.info('User signed out');
  }

  private setupTokenRefresh(token: string): void {
    try {
      const payload = this.decodeToken(token);
      if (payload?.exp) {
        const expiryTime = payload.exp * 1000; // Convert to milliseconds
        const currentTime = Date.now();
        const timeUntilRefresh = expiryTime - currentTime - this.REFRESH_BUFFER;

        if (timeUntilRefresh > 0) {
          setTimeout(() => {
            if (this._authenticated.value) {
              this.refreshToken().subscribe();
            }
          }, timeUntilRefresh);
        }
      }
    } catch (error) {
      this.logger.warn('Failed to setup token refresh', error);
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload?.exp) return true;

      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  private decodeToken(token: string): TokenPayload | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}
