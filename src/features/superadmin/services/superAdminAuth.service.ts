import { superAdminApiClient, type ApiEnvelope } from '../../../lib/superAdminApiClient';
import type { SuperAdminUser } from '../store/superAdminAuthStore';

export interface SuperAdminLoginDto {
  email: string;
  password: string;
}

export interface SuperAdminLoginResponse {
  user: SuperAdminUser;
  access_token: string;
  refresh_token: string;
}

export const superAdminAuthService = {
  // ASSUMPTION: endpoint path — confirm superadmin login route with Hafsa
  async login(dto: SuperAdminLoginDto): Promise<SuperAdminLoginResponse> {
    const res = await superAdminApiClient.post<ApiEnvelope<SuperAdminLoginResponse>>(
      '/auth/super-admin/login',
      dto,
    );
    return res.data.data;
  },
};