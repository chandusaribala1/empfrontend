import { EmployeeSummary } from "../../employee/models/employee.model";

export interface Department {
  id: number;
  name: string;
  employees: EmployeeSummary[];
}
export interface DepartmentRequest {
  name: string;
}
