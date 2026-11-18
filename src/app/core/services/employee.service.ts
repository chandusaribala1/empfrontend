import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from "@angular/common/http";
import { Observable, catchError, throwError } from "rxjs";
import {
  Employee,
  EmployeeRequest,
} from "../../features/employee/models/employee.model";
import { PageResponse } from "../../models/page-response.model";

@Injectable({ providedIn: "root" })
export class EmployeeService {
  private readonly baseUrl = "http://localhost:8080/api/employees";

  constructor(private http: HttpClient) {}

  list(
    page = 0,
    size = 10,
    sortBy = "id",
    direction = "asc",
  ): Observable<PageResponse<Employee>> {
    const params = new HttpParams()
      .set("page", page)
      .set("size", size)
      .set("sortBy", sortBy)
      .set("direction", direction);
    return this.request(
      this.http.get<PageResponse<Employee>>(this.baseUrl, { params }),
    );
  }
  get(id: number): Observable<Employee> {
    return this.request(this.http.get<Employee>(`${this.baseUrl}/${id}`));
  }
  create(payload: EmployeeRequest): Observable<Employee> {
    return this.request(this.http.post<Employee>(this.baseUrl, payload));
  }
  update(id: number, payload: EmployeeRequest): Observable<Employee> {
    return this.request(
      this.http.put<Employee>(`${this.baseUrl}/${id}`, payload),
    );
  }
  delete(id: number): Observable<void> {
    return this.request(this.http.delete<void>(`${this.baseUrl}/${id}`));
  }
  byDepartment(id: number): Observable<Employee[]> {
    return this.request(
      this.http.get<Employee[]>(`${this.baseUrl}/department/${id}`),
    );
  }
  unassigned(): Observable<Employee[]> {
    return this.request(
      this.http.get<Employee[]>(`${this.baseUrl}/unassigned`),
    );
  }
  salaryAbove(amount: number): Observable<Employee[]> {
    return this.request(
      this.http.get<Employee[]>(`${this.baseUrl}/search/salary`, {
        params: { amount },
      }),
    );
  }
  nameContains(keyword: string): Observable<Employee[]> {
    return this.request(
      this.http.get<Employee[]>(`${this.baseUrl}/search/name`, {
        params: { keyword },
      }),
    );
  }
  salaryBetween(
    minimum: number,
    maximum: number,
    page = 0,
    size = 10,
  ): Observable<PageResponse<Employee>> {
    return this.request(
      this.http.get<PageResponse<Employee>>(
        `${this.baseUrl}/search/salary-range`,
        { params: { minimum, maximum, page, size } },
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
