import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { EmployeeNamePipe } from '../../../shared/pipes/employee-name.pipe';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-my-details',
  standalone: true,
  imports: [DecimalPipe, EmployeeNamePipe],
  templateUrl: './my-details.component.html'
})
export class MyDetailsComponent implements OnInit {
  refreshing = false;
  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    this.refreshDetails();
  }

  refreshDetails(): void {
    this.refreshing = true;
    this.auth.refreshCurrentUser().subscribe({
      next: (user) => {
        this.auth.currentUser.set(user);
        this.refreshing = false;
      },
      error: () => { this.refreshing = false; },
    });
  }

  employeeCode(id: number): string {
    return `emp-${String(id).padStart(4, '0')}`;
  }
}
