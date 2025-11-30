import { Injectable } from '@angular/core';
import { Api } from './api.service';
import { UserI } from '../models/user-i';
import { BehaviorSubject, Observable } from 'rxjs';
import {take, tap, map } from 'rxjs/operators';

interface AuthResponse {
  message: string;
  token: string;
  data: UserI;
}

@Injectable({
  providedIn: 'root',
})

export class AuthService {
  private userSubject = new BehaviorSubject<UserI | null>(null);
  public currentUser$ = this.userSubject.asObservable();

  constructor(private api: Api) {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      this.userSubject.next(JSON.parse(storedUser));
    }
  }

  login(password: string, email?: string, nickname?: string): Observable<AuthResponse> {
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
  fetchCurrentUser(): Observable<UserI | null> {
    return this.api.getAll<{ data: UserI }>('users/me').pipe(
      map(res => res.data || null),
      tap(user => {
        this.userSubject.next(user);
        sessionStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  logout() {
    this.api.getAll('users/logout').pipe(take(1)).subscribe({
      next: () => this.clearUserState(),
      error: (err) => {
        console.error('Logout failed', err);
        this.clearUserState();
      }
    });
  }

  private clearUserState() {
    this.userSubject.next(null);
    sessionStorage.removeItem('user');
    window.location.href = 'https://portal-pvwr.onrender.com/login';
  }
}
