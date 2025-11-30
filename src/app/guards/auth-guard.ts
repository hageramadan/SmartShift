import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const authService = inject(AuthService);
  const allowedRoles = ['admin', 'manager'];

  const redirectToLogin = (): boolean => {
    window.location.href = 'https://portal-pvwr.onrender.com/login';
    return false;
  };

  const user = authService.getCurrentUser();
  if (user) {
    return of(allowedRoles.includes(user.role) || redirectToLogin());
  }

  // No local session → fetch from backend
  return authService.fetchCurrentUser().pipe(
    map(fetchedUser => {
      return fetchedUser && allowedRoles.includes(fetchedUser.role) || redirectToLogin(); // boolean
    }),
    catchError(() => {
      redirectToLogin();
      return of(false); // observable for catchError
    })
  );
};
