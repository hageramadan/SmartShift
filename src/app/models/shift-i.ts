export interface ShiftI {
      id: number;
  name: string;
  time?: string;
  department: string;
  location: string;
  subDepartment?: string;
  registerConfig: string;
   startTime?: string;
   endTime?: string;
   checkInStart?: boolean;
   checkOutEnd?: boolean;
   earlyCheckIn?: boolean;
}
