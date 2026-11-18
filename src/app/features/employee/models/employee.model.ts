export interface Employee {
  id: number;
  name: string;
  email: string;
  salary: number | null;
  departmentId: number | null;
  departmentName: string | null;
}

// Admin create/update requests must include the salary assigned to the employee.
export interface EmployeeRequest {
  name: string;
  email: string;
  salary: number;
  departmentId: number | null;
}

export interface EmployeeSummary {
  id: number;
  name: string;
  email: string;
}
