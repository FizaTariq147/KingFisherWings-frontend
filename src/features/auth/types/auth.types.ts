/** Re-export shared auth domain types used across the app. */
export type { AuthUser, PermissionKey, Role, JWTPayload } from '@/types/auth.types';
export type {
  LoginDto,
  TenantLoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
  TenantChangePasswordDto,
  SuperAdminLoginDto,
  SuperAdminSignupDto,
  AuthMeResponse,
  AuthLoginResult,
  UpdateMeDto,
} from './auth.api.types';
