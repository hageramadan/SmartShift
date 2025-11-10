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
        sessionStorage.setItem('user', JSON.stringify(res.data)); // optional
      })
    );
  }

  getCurrentUser(): UserI | null {
  return this.userSubject.value;
  }

  logout() {
    this.userSubject.next(null);
    sessionStorage.removeItem('user');
  }
}
