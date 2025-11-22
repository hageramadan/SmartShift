export interface DepartmentI {
  _id: string;
  id?: string;
  name: string;
  manager?: {
    _id: string;
    employeeId: string;
    fullName: string;
    contactNumber: string;
  };
  managerId?: string;
  address: string;
  locationId: string;
  staffCount?: number;
  members?: number;
  location?: {
    name: string;
    Address: string;
    id?: string ;
  };
}
