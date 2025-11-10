export interface ScheduleI {
  id: number;
  user: string;
  role: string;
  department: string;
  shift: string;
  time: string;
  date: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}
