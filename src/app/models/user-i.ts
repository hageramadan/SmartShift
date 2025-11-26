export interface UserI {
  _id: string;
  id?: string;
  employeeId: string;
  fullName: string;
  nickname: string;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  photo?: string;
  position?: {
    _id: string;
    name: string
  };
  positionId: string;
  level?: {
    _id: string;
    name: string
  };
  levelId: string;
  department?: {
    _id: string;
    name: string
  };
  departmentId: string;
  contactNumber: string;
  role: 'admin' | 'manager' | 'user';
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}






