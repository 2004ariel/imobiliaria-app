import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// precisa estar logado; senão vai para o login
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLogado() ? true : router.createUrlTree(['/login']);
};

// precisa ter uma das roles em data.roles da rota; senão acesso negado
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isLogado()) {
    return router.createUrlTree(['/login']);
  }
  const roles: string[] = route.data['roles'] ?? [];
  return roles.includes(auth.getRole() ?? '') ? true : router.createUrlTree(['/acesso-negado']);
};
