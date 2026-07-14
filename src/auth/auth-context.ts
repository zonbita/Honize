import { AsyncLocalStorage } from 'async_hooks';
import { AuthUser } from './auth.store';

export const authContext = new AsyncLocalStorage<AuthUser | null>();

export function getCurrentAuthUser(): AuthUser | null {
  return authContext.getStore() ?? null;
}
