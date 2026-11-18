import { Component } from '@angular/core';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, DatePipe, LowerCasePipe],
  templateUrl: './layout.component.html'
})
export class LayoutComponent {
  today = new Date();

  constructor(public auth: AuthService, private router: Router) {}

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
