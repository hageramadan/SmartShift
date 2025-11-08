export interface AdminProfileI {
      name: string;
  position: string;
  email: string;
  department: string;
  accessLevel: string;
  totalShifts: number;
  upcoming: number;
  completed: number;
  permissions: {
    systemAccess: boolean;
    manageDepartments: boolean;
    approveSwaps: boolean;
  };
}
