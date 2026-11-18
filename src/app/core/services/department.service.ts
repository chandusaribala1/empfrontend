import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import {
  Department,
  DepartmentRequest,
} from "../../features/department/models/department.model";
import { Employee } from "../../features/employee/models/employee.model";

@Injectable({ providedIn: "root" })
export class DepartmentService {
  private readonly baseUrl = "http://localhost:8080/api/departments";

  constructor(private http: HttpClient) {}
  list(): Observable<Department[]> {
    return this.request(this.http.get<Department[]>(this.baseUrl));
  }
  get(id: number): Observable<Department> {
    return this.request(this.http.get<Department>(`${this.baseUrl}/${id}`));
  }
  create(payload: DepartmentRequest): Observable<Department> {
    return this.request(this.http.post<Department>(this.baseUrl, payload));
  }
  update(id: number, payload: DepartmentRequest): Observable<Department> {
    return this.request(
      this.http.put<Department>(`${this.baseUrl}/${id}`, payload),
    );
  }
  delete(id: number): Observable<void> {
    return this.request(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
  employees(id: number): Observable<Employee[]> {
    return this.request(
      this.http.get<Employee[]>(`${this.baseUrl}/${id}/employees`),
    );
  }
  assign(departmentId: number, employeeId: number): Observable<Department> {
    return this.request(
      this.http.post<Department>(
        `${this.baseUrl}/${departmentId}/employees/${employeeId}`,
        {},
      ),
    );
  }
  private request<T>(source: Observable<T>): Observable<T> {
    return source.pipe(
      catchError((error: HttpErrorResponse) => {
        const message =
          error.error?.message ??
          "The API could not complete the request. Check that the backend is running.";
        return throwError(() => new Error(message));
      }),
    );
  }
}
