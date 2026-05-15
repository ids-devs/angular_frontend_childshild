import { Tenant } from "./tenant.interface";
import { User } from "./user.interface";

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  name: string;
  identifier: string;
  type: 'email' | 'phone';
  password: string;
  password_confirmation: string;
  organization_name: string;
}

// Fintra-style response structure
export interface FintraAuthResponse {
  success: boolean;
  message?: string;
  message_pt?: string;
  data: {
    access_token: string;
    token_type: 'bearer';
    expires_in: number;
    user: User;
    current_tenant?: Tenant;
    tenant?: Tenant;
    must_change?: boolean;
  };
}

// Legacy response structure (for backward compatibility)
export interface AuthResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: User;
  current_tenant?: Tenant;
  current_role?: string;
  must_change?: boolean;
  message?: string;
  // Support fintra-style response
  success?: boolean;
  data?: {
    access_token: string;
    token_type: 'bearer';
    expires_in: number;
    user: User;
    current_tenant?: Tenant;
    tenant?: Tenant;
    current_role?: string;
    must_change?: boolean;
  };
}

export interface TokenPayload {
  sub: string; // user id
  iat: number; // issued at
  exp: number; // expires at
  tenant_id?: string;
  permissions?: string[];
}

export interface ForgotPasswordRequest {
  identifier: string;
  type: 'email' | 'phone';
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
  password_confirmation: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  token_type: 'bearer';
  expires_in: number;
}
