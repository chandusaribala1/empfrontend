import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AuthUser } from '../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  notice = '';
  busy = false;

  constructor(private auth: AuthService, private router: Router) {
    this.notice = this.router.getCurrentNavigation()?.extras.state?.['notice'] ?? '';
  }

  login(): void {
    this.error = '';
    this.busy = true;
    this.auth.login(this.username.trim(), this.password).subscribe({
      next: (user: AuthUser) => {
        this.auth.saveLogin(this.username.trim(), this.password, user);
        this.busy = false;
        this.router.navigate([user.role === 'ADMIN' ? '/employees' : '/my-details']);
      },
      error: () => {
        this.error = 'Username or password is incorrect.';
        this.busy = false;
      }
    });
  }
}
