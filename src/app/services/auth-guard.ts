import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);

  if (authService.autenticado()) {
    return true;
  }

  authService.abrirModal('entrar');
  return inject(Router).createUrlTree(['/']);
};