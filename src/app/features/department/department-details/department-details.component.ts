import { Component, Input } from "@angular/core";
import { TitleCasePipe } from "@angular/common";
import { Department } from "../models/department.model";
import { Employee } from "../../employee/models/employee.model";

@Component({
  selector: "app-department-details",
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: "./department-details.component.html",
})
export class DepartmentDetailsComponent {
  @Input() department: Department | null = null;
  @Input() employees: Employee[] = [];

  employeeCode(id: number): string {
    return `emp-${String(id).padStart(4, "0")}`;
  }
}
