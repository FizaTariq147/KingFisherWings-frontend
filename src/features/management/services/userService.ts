import type { UserRow } from '../types/user.types';

// Placeholder — swap this out for a real API call later, same function signature
export const userService = {
  getUsers: async (): Promise<UserRow[]> => {
    // await fetch('/api/users') ...
    return [];
  },
  getSubscriptionKey: async (): Promise<string> => {
    // await fetch('/api/subscription-key') ...
    return '';
  },
};