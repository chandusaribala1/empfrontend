import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import { UpperCasePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Department } from "./models/department.model";
import { Employee } from "../employee/models/employee.model";
import { DepartmentService } from "../../core/services/department.service";
import { DepartmentDetailsComponent } from "./department-details/department-details.component";
import { DepartmentFormComponent } from "./department-form/department-form.component";

@Component({
  selector: "app-department",
  standalone: true,
  imports: [
    FormsModule,
    UpperCasePipe,
    DepartmentDetailsComponent,
    DepartmentFormComponent,
  ],
  templateUrl: "./department.component.html",
})
export class DepartmentComponent implements OnInit, OnDestroy {
  departments = signal<Department[]>([]);
  selected = signal<Department | null>(null);
  employeesForSelected = signal<Employee[]>([]);
  name = signal("");
  error = signal("");
  notice = signal("");

  editingDepartmentId: number | null = null;
  editDepartmentName = "";
  private originalDepartmentName = "";
  private subscriptions = new Subscription();

  constructor(
    private departmentService: DepartmentService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.load();
    const id = Number(this.route.snapshot.paramMap.get("id"));
    if (Number.isInteger(id) && id > 0) {
      this.loadSelectedDepartment(id);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  employeeCode(id: number): string {
    return `emp-${String(id).padStart(4, "0")}`;
  }

  load(): void {
    this.subscriptions.add(
      this.departmentService.list().subscribe({
        next: (items) => this.departments.set(items),
        error: (err: Error) => this.fail(err),
      }),
    );
  }

  create(): void {
    const departmentName = this.name().trim();
    if (!departmentName) {
      return;
    }

    this.subscriptions.add(
      this.departmentService.create({ name: departmentName }).subscribe({
        next: (item) => {
          this.notice.set(`Department ${item.name} created.`);
          this.error.set("");
          this.name.set("");
          this.load();
        },
        error: (err: Error) => this.fail(err),
      }),
    );
  }

  view(department: Department): void {
    this.router.navigate([department.id], { relativeTo: this.route });
  }

  loadSelectedDepartment(id: number): void {
    this.subscriptions.add(
      this.departmentService.get(id).subscribe({
        next: (department) => {
          this.selected.set(department);
          this.loadDepartmentEmployees(department.id);
        },
        error: (err: Error) => this.fail(err),
      }),
    );
  }

  private loadDepartmentEmployees(id: number): void {
    this.subscriptions.add(
      this.departmentService.employees(id).subscribe({
        next: (items) => this.employeesForSelected.set(items),
        error: (err: Error) => this.fail(err),
      }),
    );
  }

  edit(department: Department): void {
    this.editingDepartmentId = department.id;
    this.originalDepartmentName = department.name;
    this.editDepartmentName = department.name;
    this.error.set("");
    this.notice.set("");
  }

  cancelEdit(): void {
    this.editingDepartmentId = null;
    this.editDepartmentName = "";
    this.originalDepartmentName = "";
  }

  hasUnsavedChanges(): boolean {
    return (
      this.editingDepartmentId !== null &&
      this.editDepartmentName.trim() !== this.originalDepartmentName.trim()
    );
  }

  saveEdit(department: Department): void {
    const departmentName = this.editDepartmentName.trim();
    if (!departmentName) {
      this.error.set("Department name is required.");
      this.notice.set("");
      return;
    }

    this.subscriptions.add(
      this.departmentService
        .update(department.id, { name: departmentName })
        .subscribe({
          next: (updated) => {
            this.notice.set(`Department renamed to ${updated.name}.`);
            this.error.set("");
            this.cancelEdit();
            this.load();
            if (this.selected()?.id === updated.id) {
              this.selected.set(updated);
              this.loadDepartmentEmployees(updated.id);
            }
          },
          error: (err: Error) => this.fail(err),
        }),
    );
  }

  remove(department: Department): void {
    this.subscriptions.add(
      this.departmentService.delete(department.id).subscribe({
        next: () => {
          this.notice.set(
            `Department ${department.name} deleted. Its employees are now unassigned.`,
          );
          this.error.set("");
          this.departments.update((items) =>
            items.filter((item) => item.id !== department.id),
          );
          if (this.selected()?.id === department.id) {
            this.selected.set(null);
            this.employeesForSelected.set([]);
            this.router.navigate(["/departments"]);
          }
          if (this.editingDepartmentId === department.id) {
            this.cancelEdit();
          }
        },
        error: (err: Error) => this.fail(err),
      }),
    );
  }

  private fail(error: Error): void {
    this.error.set(error.message);
    this.notice.set("");
  }
}
