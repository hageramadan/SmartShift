import { Injectable } from '@angular/core';
import { DepartmentI } from '../models/department-i';
import { ApiResponse } from '../models/api-response';
import { Api } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {

  constructor(private api: Api) { }

  getDepartments(): Observable<ApiResponse<DepartmentI[]>> {
    return this.api.getAll<ApiResponse<DepartmentI[]>>('departments');
  }

  getDepartmentById(id: string): Observable<ApiResponse<DepartmentI>> {
    return this.api.getById<ApiResponse<DepartmentI>>('departments', id);
  }

  createDepartment(dept: Partial<DepartmentI>): Observable<ApiResponse<DepartmentI>> {
    return this.api.post<ApiResponse<DepartmentI>>('departments', dept);
  }

  updateDepartment(id: string, dept: Partial<DepartmentI>): Observable<ApiResponse<DepartmentI>> {
    return this.api.patch<ApiResponse<DepartmentI>>('departments', id, dept);
  }

  deleteDepartment(id: string): Observable<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>('departments', id);
  }
}

