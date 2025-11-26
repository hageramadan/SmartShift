import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_BASE_URL } from '../utils/constants';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root',
})
export class Api {
  constructor(private http: HttpClient) { }

  getAll<T>(endpoint: string, filters?: any): Observable<T> {
    let httpParams = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return this.http.get<T>(`${API_BASE_URL}/${endpoint}`, {params: httpParams, withCredentials: true });
  }

  getById<T>(endpoint: string, id: string): Observable<T> {
    return this.http.get<T>(`${API_BASE_URL}/${endpoint}/${id}`, { withCredentials: true });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${API_BASE_URL}/${endpoint}`, body, { withCredentials: true });
  }

  put<T>(endpoint: string, id: string, body: any): Observable<T> {
    return this.http.put<T>(`${API_BASE_URL}/${endpoint}/${id}`, body, { withCredentials: true });
  }

  patch<T>(endpoint: string, id: string, body: any): Observable<T> {
    return this.http.patch<T>(`${API_BASE_URL}/${endpoint}/${id}`, body, { withCredentials: true });
  }

  delete<T>(endpoint: string, id: string): Observable<T> {
    return this.http.delete<T>(`${API_BASE_URL}/${endpoint}/${id}`, { withCredentials: true });
  }
}
