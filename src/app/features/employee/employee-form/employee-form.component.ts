import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Department } from "../../department/models/department.model";
import { Employee, EmployeeRequest } from "../models/employee.model";

@Component({
  selector: "app-employee-form",
  standalone: true,
  imports: [FormsModule],
  templateUrl: "./employee-form.component.html",
})
export class EmployeeFormComponent implements OnChanges {
  @Input() departments: Department[] = [];
  @Input() employee: Employee | null = null;
  @Input() busy = false;
  @Output() saveRequested = new EventEmitter<EmployeeRequest>();
  @Output() cancelRequested = new EventEmitter<void>();

  name = "";
  email = "";
  salary: number | null = null;
  departmentId: number | null = null;
  submitted = false;

  // The parent may select a different employee after this form has opened.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["employee"]) {
      this.name = this.employee?.name ?? "";
      this.email = this.employee?.email ?? "";
      this.salary = this.employee?.salary ?? null;
      this.departmentId = this.employee?.departmentId ?? null;
      this.submitted = false;
    }
  }

  isValidEmail(email: string): boolean {
    return /^[A-Za-z0-9._%+-]+@gmail\.com$/i.test(email.trim());
  }

  isValidSalary(): boolean {
    return (
      this.salary !== null &&
      Number.isFinite(Number(this.salary)) &&
      Number(this.salary) > 0
    );
  }

  save(): void {
    this.submitted = true;
    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.isValidEmail(this.email) ||
      !this.isValidSalary()
    ) {
      return;
    }

    this.saveRequested.emit({
      name: this.name.trim(),
      email: this.email.trim(),
      salary: Number(this.salary),
      departmentId: this.departmentId ? Number(this.departmentId) : null,
    });
  }

  cancel(): void {
    this.cancelRequested.emit();
  }
}
