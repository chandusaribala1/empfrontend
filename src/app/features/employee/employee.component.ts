import { Component, OnDestroy, OnInit, signal } from "@angular/core";
import {
  CurrencyPipe,
  DecimalPipe,
  LowerCasePipe,
  UpperCasePipe,
} from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { Employee, EmployeeRequest } from "./models/employee.model";
import { PageResponse } from "../../models/page-response.model";
import { Department } from "../department/models/department.model";
import { EmployeeService } from "../../core/services/employee.service";
import { DepartmentService } from "../../core/services/department.service";
import { EmployeeNamePipe } from "../../shared/pipes/employee-name.pipe";
import { EmployeeDetailsComponent } from "./employee-details.component";
import { EmployeeFormComponent } from "./employee-form/employee-form.component";

type EmployeeSortField = "id" | "name" | "email" | "salary";

@Component({
  selector: "app-employee",
  standalone: true,
  imports: [
    FormsModule,
    CurrencyPipe,
    DecimalPipe,
    LowerCasePipe,
    UpperCasePipe,
    EmployeeNamePipe,
    EmployeeDetailsComponent,
    EmployeeFormComponent,
  ],
  templateUrl: "./employee.component.html",
})
export class EmployeeComponent implements OnInit, OnDestroy {
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  selected = signal<Employee | null>(null);
  editingEmployee = signal<Employee | null>(null);
  busy = signal(false);
  error = signal("");
  notice = signal("");

  private searchResults: Employee[] | null = null;
  private subscriptions = new Subscription();

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;
  sortBy: EmployeeSortField = "id";
  direction: "asc" | "desc" = "asc";
  searchDepartment = "";
  searchSalary: number | null = null;
  searchName = "";
  rangeMin: number | null = null;
  rangeMax: number | null = null;
  searchError = "";

  constructor(
    private employeeService: EmployeeService,
    private departmentService: DepartmentService,
  ) {}

  ngOnInit(): void {
    this.load();
    this.loadDepartments();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  employeeCode(id: number): string {
    return `emp-${String(id).padStart(4, "0")}`;
  }

  changeSort(field: EmployeeSortField): void {
    this.direction =
      this.sortBy === field && this.direction === "asc" ? "desc" : "asc";
    this.sortBy = field;
    this.page = 0;
    if (this.searchResults !== null) {
      this.searchResults = this.sortSearchResults(this.searchResults);
      this.showSearchPage();
    } else {
      this.load();
    }
  }

  sortIndicator(field: EmployeeSortField): string {
    if (this.sortBy !== field) {
      return "↕";
    }
    return this.direction === "asc" ? "↑" : "↓";
  }

  load(): void {
    this.searchResults = null;
    this.busy.set(true);
    this.error.set("");
    this.subscriptions.add(
      this.employeeService
        .list(this.page, this.size, this.sortBy, this.direction)
        .subscribe({
          next: (result: PageResponse<Employee>) => {
            this.employees.set(result.content);
            this.totalPages = result.totalPages;
            this.totalElements = result.totalElements;
            this.busy.set(false);
          },
          error: (err: Error) => {
            this.fail(err);
            this.busy.set(false);
          },
        }),
    );
  }

  loadDepartments(): void {
    this.subscriptions.add(
      this.departmentService.list().subscribe({
        next: (items: Department[]) => this.departments.set(items),
        error: (err: Error) => this.fail(err),
      }),
    );
  }

  save(request: EmployeeRequest): void {
    this.error.set("");
    this.notice.set("");
    const employee = this.editingEmployee();
    const saveRequest =
      employee === null
        ? this.employeeService.create(request)
        : this.employeeService.update(employee.id, request);

    this.subscriptions.add(
      saveRequest.subscribe({
        next: () => {
          this.notice.set(
            employee === null ? "Employee created." : "Employee updated.",
          );
          this.editingEmployee.set(null);
          this.load();
          this.loadDepartments();
        },
        error: (err: Error) => this.fail(err),
      }),
    );
  }

  edit(employee: Employee): void {
    this.editingEmployee.set(employee);
    this.selected.set(employee);
    this.error.set("");
  }

  cancelEdit(): void {
    this.editingEmployee.set(null);
  }

  remove(employee: Employee): void {
    this.subscriptions.add(
      this.employeeService.delete(employee.id).subscribe({
        next: () => {
          this.notice.set("Employee deleted.");
          this.selected.update((current) =>
            current?.id === employee.id ? null : current,
          );
          this.load();
          this.loadDepartments();
        },
        error: (err: Error) => this.fail(err),
      }),
    );
  }

  choose(employee: Employee): void {
    this.selected.set(employee);
  }

  changePage(delta: number): void {
    this.page = Math.max(0, Math.min(this.totalPages - 1, this.page + delta));
    if (this.searchResults !== null) {
      this.showSearchPage();
    } else {
      this.load();
    }
  }

  changeSize(): void {
    this.page = 0;
    if (this.hasSearchFilters()) {
      this.searchEmployees();
    } else {
      this.load();
    }
  }

  searchEmployees(): void {
    const hasMinimum = this.rangeMin !== null;
    const hasMaximum = this.rangeMax !== null;
    if (hasMinimum !== hasMaximum) {
      this.searchError = "Enter both minimum and maximum salary values.";
      return;
    }
    if (
      hasMinimum &&
      hasMaximum &&
      Number(this.rangeMin) > Number(this.rangeMax)
    ) {
      this.searchError = "Minimum salary cannot exceed maximum salary.";
      return;
    }
    if (this.searchSalary !== null && Number(this.searchSalary) <= 0) {
      this.searchError = "Salary must be greater than zero.";
      return;
    }
    if (
      hasMinimum &&
      (Number(this.rangeMin) <= 0 || Number(this.rangeMax) <= 0)
    ) {
      this.searchError = "Salary values must be greater than zero.";
      return;
    }

    const filters: string[] = [];
    if (this.searchName.trim()) filters.push("name");
    if (this.searchDepartment) filters.push("department");
    if (this.searchSalary !== null) filters.push("salary");
    if (hasMinimum && hasMaximum) filters.push("range");

    if (filters.length === 0) {
      this.searchError = "";
      this.page = 0;
      this.load();
      return;
    }

    this.busy.set(true);
    this.searchError = "";
    this.error.set("");
    this.loadSearchFilter(filters, 0, []);
  }

  private loadSearchFilter(
    filters: string[],
    index: number,
    groups: Employee[][],
  ): void {
    if (index === filters.length) {
      this.showSearch(this.findMatchingEmployees(groups));
      this.busy.set(false);
      return;
    }

    const filter = filters[index];
    if (filter === "name") {
      this.subscriptions.add(
        this.employeeService.nameContains(this.searchName.trim()).subscribe({
          next: (items) =>
            this.loadSearchFilter(filters, index + 1, [...groups, items]),
          error: (err: Error) => this.searchFailed(err),
        }),
      );
    } else if (filter === "department") {
      this.subscriptions.add(
        this.employeeService
          .byDepartment(Number(this.searchDepartment))
          .subscribe({
            next: (items) =>
              this.loadSearchFilter(filters, index + 1, [...groups, items]),
            error: (err: Error) => this.searchFailed(err),
          }),
      );
    } else if (filter === "salary") {
      this.subscriptions.add(
        this.employeeService.salaryAbove(Number(this.searchSalary)).subscribe({
          next: (items) =>
            this.loadSearchFilter(filters, index + 1, [...groups, items]),
          error: (err: Error) => this.searchFailed(err),
        }),
      );
    } else {
      this.loadSalaryRange(
        Number(this.rangeMin),
        Number(this.rangeMax),
        0,
        [],
        (items) => {
          this.loadSearchFilter(filters, index + 1, [...groups, items]);
        },
      );
    }
  }

  private loadSalaryRange(
    minimum: number,
    maximum: number,
    pageNumber: number,
    allEmployees: Employee[],
    finished: (items: Employee[]) => void,
  ): void {
    this.subscriptions.add(
      this.employeeService
        .salaryBetween(minimum, maximum, pageNumber, 100)
        .subscribe({
          next: (result) => {
            const employees = [...allEmployees, ...result.content];
            if (result.last || pageNumber + 1 >= result.totalPages) {
              finished(employees);
            } else {
              this.loadSalaryRange(
                minimum,
                maximum,
                pageNumber + 1,
                employees,
                finished,
              );
            }
          },
          error: (err: Error) => this.searchFailed(err),
        }),
    );
  }

  private findMatchingEmployees(groups: Employee[][]): Employee[] {
    const matchingIds = new Set(groups[0].map((employee) => employee.id));
    for (const group of groups.slice(1)) {
      const groupIds = new Set(group.map((employee) => employee.id));
      for (const id of matchingIds) {
        if (!groupIds.has(id)) {
          matchingIds.delete(id);
        }
      }
    }
    const matches = groups[0].filter((employee) =>
      matchingIds.has(employee.id),
    );
    return this.sortSearchResults(matches);
  }

  private searchFailed(error: Error): void {
    this.fail(error);
    this.busy.set(false);
  }

  private hasSearchFilters(): boolean {
    return (
      !!this.searchName.trim() ||
      !!this.searchDepartment ||
      this.searchSalary !== null ||
      this.rangeMin !== null ||
      this.rangeMax !== null
    );
  }

  clearSearch(): void {
    this.searchDepartment = "";
    this.searchName = "";
    this.searchSalary = null;
    this.rangeMin = null;
    this.rangeMax = null;
    this.searchError = "";
    this.page = 0;
    this.load();
  }

  private showSearch(items: Employee[]): void {
    this.searchResults = items;
    this.totalElements = items.length;
    this.totalPages = Math.ceil(items.length / this.size);
    this.page = 0;
    this.error.set("");
    this.showSearchPage();
  }

  private showSearchPage(): void {
    if (this.searchResults === null) {
      return;
    }
    const start = this.page * this.size;
    this.employees.set(this.searchResults.slice(start, start + this.size));
  }


  private sortSearchResults(items: Employee[]): Employee[] {
    const direction = this.direction === "asc" ? 1 : -1;

    return [...items].sort((first, second) => {
      if (this.sortBy === "id" || this.sortBy === "salary") {
        const firstValue = first[this.sortBy];
        const secondValue = second[this.sortBy];

        // Keep employees without salary at the end.
        if (firstValue === null && secondValue === null) return 0;
        if (firstValue === null) return 1;
        if (secondValue === null) return -1;

        return (firstValue - secondValue) * direction;
      }

      return first[this.sortBy].localeCompare(second[this.sortBy]) * direction;
    });
  }


  private fail(error: Error): void {
    this.error.set(error.message);
    this.notice.set("");
  }
}
