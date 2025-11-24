// models/schedule-i.ts
export interface ScheduleI {
  _id?: string;
  date: string;
  departmentId: string;
  userId: string;
  shiftId: string;
  subDepartmentId: string;
  isActive?: boolean;
  
  department?: {
    _id: string;
    name: string;
    id: string;
  };
  subDepartment?: {
    _id: string;
    name: string;
    id: string;
  };
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    id: string;
  };
  shift?: {
    _id: string;
    shiftName: string;
    startTimeFormatted: string;
    endTimeFormatted: string;
    id: string;
  };
}

export interface CreateScheduleRequest {
  date: string;
  shiftId: string;
  subDepartmentId: string;
  userId: string;
  departmentId: string;
}