import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Api } from './api.service';
import { ApiResponse } from '../models/api-response';

@Injectable({
  providedIn: 'root',
})
export class CrudService {

  constructor(private api: Api) {}

  getAll<T>(endpoint: string): Observable<ApiResponse<T[]>> {
    return this.api.getAll<ApiResponse<T[]>>(endpoint);
  }

  getById<T>(endpoint: string, id: string): Observable<ApiResponse<T>> {
    return this.api.getById<ApiResponse<T>>(endpoint, id);
  }

  create<T>(endpoint: string, data: Partial<T>): Observable<ApiResponse<T>> {
    return this.api.post<ApiResponse<T>>(endpoint, data );
  }

  update<T>(endpoint: string, id: string, data: Partial<T>): Observable<ApiResponse<T>> {
    return this.api.patch<ApiResponse<T>>(endpoint, id, data);
  }

  delete<T>(endpoint: string, id: string): Observable<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>(endpoint, id);
  }
}
