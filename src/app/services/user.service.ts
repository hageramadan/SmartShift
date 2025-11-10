import { Injectable } from '@angular/core';
import { UserI } from '../models/user-i';
import { ApiResponse } from '../models/api-response';
import { Api } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private api: Api) {}

  getUsers(): Observable<ApiResponse<UserI[]>> {
    return this.api.getAll<ApiResponse<UserI[]>>('users');
  }

  getUserById(id: string): Observable<ApiResponse<UserI>> {
    return this.api.getById<ApiResponse<UserI>>('users', id);
  }

  createUser(user: Partial<UserI>): Observable<ApiResponse<UserI>> {
    return this.api.post<ApiResponse<UserI>>('users', user);
  }

  updateUser(id: string, user: Partial<UserI>): Observable<ApiResponse<UserI>> {
    return this.api.patch<ApiResponse<UserI>>('users', id, user);
  }

  deleteUser(id: string): Observable<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>('users', id);
  }
}
