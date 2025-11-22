import { DepartmentI } from "./department-i";
import { UserI } from "./user-i";

export interface SubDepartmentI {
  _id?: string;
  name?: string;
  departmentId?: string;
  subManagerId?: string;
  createdAt?:string;
  updatedAt?:string;
  subManager?: UserI;
  department?: DepartmentI;
  id?: string;
}
