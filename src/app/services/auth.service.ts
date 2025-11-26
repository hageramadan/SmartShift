import { Injectable } from '@angular/core';
import { Api } from './api.service';
import { UserI } from '../models/user-i';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface AuthResponse {
  message: string;
  token: string;
  data: UserI;
}

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private userSubject = new BehaviorSubject<UserI | null>(JSON.parse(sessionStorage.getItem('user') || 'null'));
  public currentUser$ = this.userSubject.asObservable();

  constructor(private api: Api) { }

  login(password: string, email?: string, nickname?: string) {
  return this.api.post<AuthResponse>('users/login', { email, nickname, password }).pipe(
    tap(res => {
      this.userSubject.next(res.data);
      sessionStorage.setItem('user', JSON.stringify(res.data));
    })
  );
}


  getCurrentUser(): UserI | null {
  return this.userSubject.value;
  }

  // Fetch user from backend
  fetchCurrentUser() {
    return this.api.getAll<UserI>('users/me').pipe(
      tap(user => {
        if (user) {
          this.userSubject.next(user);
          sessionStorage.setItem('user', JSON.stringify(user));
        }
      })
    );
  }

  logout() {
  // Call backend to destroy session/cookie
  this.api.getAll('users/logout').subscribe({
    next: () => {
      // Clear frontend state
      this.userSubject.next(null);
      sessionStorage.removeItem('user');
      // Redirect to React login page
      window.location.href = 'http://localhost:3001/login';
    },
    error: (err) => {
      console.error('Logout failed', err);
      // Still clear frontend state even if backend fails
      this.userSubject.next(null);
      sessionStorage.removeItem('user');
      window.location.href = 'http://localhost:3001/login';
    }
  });
}
}
