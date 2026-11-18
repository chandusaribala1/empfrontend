import { Employee } from '../../employee/models/employee.model';

export interface AuthUser {
  username: string;
  role: 'ADMIN' | 'EMPLOYEE';
  employee: Employee | null;
}

export interface EmployeeRegistration {
  username: string;
  password: string;
  name: string;
  email: string;
}
