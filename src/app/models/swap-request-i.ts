import { from } from "rxjs";

export interface SwapRequestI {
  id?: string;
  _id: string;
  fromScheduleId: string;
  toScheduleId?: string;
  fromUserId?: string;
  toUserId?: string;
  targetUser?: string;
  message?: string;
  isActive?: string;
  createdAt?: string;
  updatedAt?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  fromUser?: {
    _id: string;
    fullName?: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'manager' | 'admin';
  },
  toUser?: {
    _id: string;
    fullName?: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'manager' | 'admin';
    },
  fromSchedule?: {
    _id: string;
    date: string;
    shiftId: {
      _id: string;
      shiftType: string;
      shiftName: string;
      srartTimeFormatted?: string;
      endTimeFormatted?: string;
      durationFormatted?: string;
    },
    subDepartmentId?: {
      _id: string;
      name: string;
    }
  },
  toSchedule?: {
    _id: string;
    date: string;
    shiftId: {
      _id: string;
      shiftType: string;
      shiftName: string;
      srartTimeFormatted?: string;
      endTimeFormatted?: string;
      durationFormatted?: string;
    },
    subDepartmentId?: {
      _id: string;
      name: string;
    }
  }
}
