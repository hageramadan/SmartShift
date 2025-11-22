import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class DepartmentsServiceTs {
   private API_URL = 'https://smartshift-c240077eea3a.herokuapp.com/api/v1/departments';

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<any> {

    return this.http.get(this.API_URL , { withCredentials: true });
  }
}
