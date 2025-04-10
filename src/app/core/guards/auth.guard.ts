import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guarda general para bloquear rutas si no hay token válido.
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  return !!token;
};

/**
 * Guarda opcional por rol.
 */
export const roleGuard = (role: 'admin' | 'user'): CanActivateFn => () => {
  const auth = inject(AuthService);
  return auth.getRole() === role;
};
