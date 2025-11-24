// services/schedules.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  ScheduleI, 
  CreateScheduleRequest
} from '../models/schedule-i';
import { Api } from './api.service';
import { ApiResponse } from '../models/api-response';
import { ShiftI } from '../models/shift-i';

export interface ScheduleFilters {
  startDate?: string;
  endDate?: string;
  departmentId?: string;
  subDepartmentId?: string;
  userId?: string;
   shiftId?: string;
  page?: number;
  limit?: number;
}

@Injectable({
  providedIn: 'root',
})
export class SchedulesService {
  
  constructor(private api: Api) { }

  getSchedules(filters?: ScheduleFilters): Observable<ApiResponse<ScheduleI[]>> {
    let endpoint = 'schedules';
    const params: string[] = [];

    if (filters) {
      if (filters.startDate) params.push(`startDate=${filters.startDate}`);
      if (filters.endDate) params.push(`endDate=${filters.endDate}`);
      if (filters.departmentId) params.push(`departmentId=${filters.departmentId}`);
      if (filters.subDepartmentId) params.push(`subDepartmentId=${filters.subDepartmentId}`);
      if (filters.userId) params.push(`userId=${filters.userId}`);
      if (filters.page) params.push(`page=${filters.page}`);
      if (filters.limit) params.push(`limit=${filters.limit}`);
    }

    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }

    return this.api.getAll<ApiResponse<ScheduleI[]>>(endpoint);
  }

  getScheduleById(id: string): Observable<ApiResponse<ScheduleI>> {
    return this.api.getById<ApiResponse<ScheduleI>>('schedules', id);
  }

  createSchedule(scheduleData: CreateScheduleRequest): Observable<ApiResponse<ScheduleI>> {
    return this.api.post<ApiResponse<ScheduleI>>('schedules', scheduleData);
  }

  updateSchedule(id: string, scheduleData: Partial<ScheduleI>): Observable<ApiResponse<ScheduleI>> {
    return this.api.patch<ApiResponse<ScheduleI>>('schedules', id, scheduleData);
  }

  deleteSchedule(id: string): Observable<ApiResponse<null>> {
    return this.api.delete<ApiResponse<null>>('schedules', id);
  }

  toggleScheduleStatus(id: string, isActive: boolean): Observable<ApiResponse<ScheduleI>> {
    return this.api.patch<ApiResponse<ScheduleI>>('schedules', id, { isActive });
  }

  getUserSchedules(userId: string, filters?: Omit<ScheduleFilters, 'userId'>): Observable<ApiResponse<ScheduleI[]>> {
    let endpoint = `schedules/user/${userId}`;
    const params: string[] = [];

    if (filters) {
      if (filters.startDate) params.push(`startDate=${filters.startDate}`);
      if (filters.endDate) params.push(`endDate=${filters.endDate}`);
      if (filters.departmentId) params.push(`departmentId=${filters.departmentId}`);
      if (filters.subDepartmentId) params.push(`subDepartmentId=${filters.subDepartmentId}`);
      if (filters.page) params.push(`page=${filters.page}`);
      if (filters.limit) params.push(`limit=${filters.limit}`);
    }

    if (params.length > 0) {
      endpoint += `?${params.join('&')}`;
    }

    return this.api.getAll<ApiResponse<ScheduleI[]>>(endpoint);
  }

  getShifts(): Observable<ApiResponse<ShiftI[]>> {
    return this.api.getAll<ApiResponse<ShiftI[]>>('shifts');
  }
}