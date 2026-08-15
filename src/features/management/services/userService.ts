import { managementService } from './management.service';
import type { UserRow } from '../types/user.types';

/** Management User Access — backed by GET /users. */
export const userService = {
  getUsers: async (search?: string): Promise<UserRow[]> => managementService.listUsers(search),
  getSubscriptionKey: async (): Promise<string> => managementService.getSubscriptionKey(),
};
