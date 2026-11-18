import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthUser, EmployeeRegistration } from '../../features/auth/models/auth.model';
import { Employee } from '../../features/employee/models/employee.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = 'http://localhost:8080/api/auth';
  private authorization = '';
  currentUser = signal<AuthUser | null>(null);

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<AuthUser> {
    const credentials = this.makeBasicCredentials(username, password);
    const headers = new HttpHeaders({ Authorization: `Basic ${credentials}` });
    return this.http.get<AuthUser>(`${this.baseUrl}/me`, { headers });
  }

  saveLogin(username: string, password: string, user: AuthUser): void {
    this.authorization = this.makeBasicCredentials(username, password);
    this.currentUser.set(user);
  }

  authorizationHeader(): string | null {
    return this.authorization ? `Basic ${this.authorization}` : null;
  }

  register(request: EmployeeRegistration): Observable<Employee> {
    return this.http.post<Employee>(`${this.baseUrl}/register`, request);
  }

  refreshCurrentUser(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/me`);
  }

  logout(): void {
    this.authorization = '';
    this.currentUser.set(null);
  }

  private makeBasicCredentials(username: string, password: string): string {
    const bytes = new TextEncoder().encode(`${username}:${password}`);
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return btoa(binary);
  }
}
