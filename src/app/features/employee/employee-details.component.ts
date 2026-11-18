import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  signal,
} from "@angular/core";
import { DecimalPipe, TitleCasePipe } from "@angular/common";
import { Employee } from "./models/employee.model";
import { EmployeeNamePipe } from "../../shared/pipes/employee-name.pipe";

@Component({
  selector: "app-employee-details",
  standalone: true,
  imports: [DecimalPipe, TitleCasePipe, EmployeeNamePipe],
  template: `
    @if (currentEmployee()) {
      <aside class="detail-card">
        <div>
          <p class="eyebrow">SELECTED EMPLOYEE</p>
          <h3>{{ currentEmployee()!.name | employeeName }}</h3>
          <small>Employee ID: {{ employeeCode() }}</small>
        </div>
        <dl>
          <div>
            <dt>Email</dt>
            <dd>{{ currentEmployee()!.email }}</dd>
          </div>
          <div>
            <dt>Salary</dt>
            <dd>{{ currentEmployee()!.salary === null ? "Not assigned" : (currentEmployee()!.salary | number: "1.2-2") }}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd [attr.title]="currentEmployee()!.departmentName | titlecase">
              {{ currentEmployee()!.departmentName || "Unassigned" }}
            </dd>
          </div>
        </dl>
        <button type="button" (click)="requestEdit()">Edit Employee</button>
      </aside>
    } @else {
      <aside class="detail-card empty-detail">
        Select a row to view employee details.
      </aside>
    }
  `,
})
export class EmployeeDetailsComponent implements OnChanges {
  // Receives the row selected in the employee directory for display here.
  @Input() employee: Employee | null = null;

  currentEmployee = signal<Employee | null>(null);

  // Sends the selected employee back to the parent when Edit Employee is clicked.
  @Output() editRequested = new EventEmitter<Employee>();

  // Keep the displayed employee current when the parent selects another row.
  ngOnChanges(changes: SimpleChanges): void {
    if (changes["employee"]) {
      this.currentEmployee.set(this.employee);
    }
  }

  // Formats the employee's numeric database ID for display in the details card.
  employeeCode(): string {
    return `emp-${String(this.currentEmployee()?.id ?? 0).padStart(4, "0")}`;
  }

  requestEdit(): void {
    const employee = this.currentEmployee();
    if (employee) this.editRequested.emit(employee);
  }
}
