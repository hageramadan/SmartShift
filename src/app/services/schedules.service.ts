// schedules.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SharedService } from './shared.service';
import { ApiResponse } from '../models/api-response';
import { ScheduleI, CreateScheduleRequest } from '../models/schedule-i';
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
  providedIn: 'root'
})
export class SchedulesService {

  constructor(private sharedService: SharedService) { }

  getSchedules(filters: ScheduleFilters): Observable<ApiResponse<ScheduleI[]>> {
    let endpoint = 'schedules';
    const params = new URLSearchParams();

    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.departmentId) params.append('departmentId', filters.departmentId);
    if (filters.subDepartmentId) params.append('subDepartmentId', filters.subDepartmentId);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.shiftId) params.append('shiftId', filters.shiftId);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.sharedService.getAll<ScheduleI[]>(endpoint, {isActive: true});
  }

  // دالة واحدة لتحميل جميع الشفتات
  getShiftsForSchedules(): Observable<ApiResponse<ShiftI[]>> {
    return this.sharedService.getAll<ShiftI[]>('shifts');
  }

  createSchedule(schedule: CreateScheduleRequest): Observable<ApiResponse<ScheduleI>> {
    return this.sharedService.post<ScheduleI>('schedules', schedule);
  }

  createMultipleSchedules(data: {
    dates: string[];
    userIds: string[];
    departmentId: string;
    shiftId: string;
    subDepartmentId: string;
  }): Observable<ApiResponse<ScheduleI[]>> {
    return this.sharedService.post<ScheduleI[]>('schedules/createMultiUser', data);
  }

  updateSchedule(id: string, schedule: Partial<ScheduleI>): Observable<ApiResponse<ScheduleI>> {
    return this.sharedService.patch<ScheduleI>('schedules', id, schedule);
  }

  deleteSchedule(id: string): Observable<ApiResponse<any>> {
    return this.sharedService.delete<any>('schedules', id);
  }
} 