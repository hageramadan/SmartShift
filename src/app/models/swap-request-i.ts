export interface SwapRequestI {
  id: number;
  name?: string;
  date: string;
  requester?: string;
  requesterDepartment?: string;
  targetUser?: string;
  targetDepartment?: string;
  fromShift?: string;
  toShift?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
}
