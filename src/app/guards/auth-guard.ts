import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.getCurrentUser();

 // Not logged in → redirect to React app login
  if (!user) {
    window.location.href = 'http://localhost:3001/login';
    return false;
  }

  // Role check → redirect to React app or "Not Authorized" page
  if (user.role !== 'admin' && user.role !== 'manager') {
    window.location.href = 'http://localhost:3001/login';
    return false;
  }

  return true;
};
