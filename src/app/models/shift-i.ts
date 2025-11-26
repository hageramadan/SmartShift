
export interface ShiftI {
  _id: string;
  departmentId: string;
  subDepartmentId: string;
  shiftName: string;
  shiftType?: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  isOvernight: boolean;
  startTimeFormatted: string;
  endTimeFormatted: string;
  durationFormatted: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  id?: string;
}
