// models/user-profile.ts
export interface UserProfileI {
  _id?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  role: string;
  employeeId?: string;
  nickname?: string;
  contactNumber?: string;
  photo?: string;
  department: {
    _id: string;
    name: string;
  };
  position: {
    _id: string;
    name: string;
  };
  level: {
    _id: string;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}