import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html'
})
export class RegisterComponent {
  username = '';
  password = '';
  name = '';
  email = '';
  error = '';
  notice = '';
  busy = false;

  constructor(private auth: AuthService, private router: Router) {}

  register(): void {
    this.error = '';
    this.notice = '';
    if (!this.name.trim()) {
      this.error = 'Enter your name.';
      return;
    }

    this.busy = true;
    this.auth.register({
      username: this.username.trim(),
      password: this.password,
      name: this.name.trim(),
      email: this.email.trim()
    }).subscribe({
      next: () => {
        this.busy = false;
        this.notice = 'Employee account created. You can now sign in.';
        this.router.navigate(['/login'], { state: { notice: this.notice } });
      },
      error: (error: { error?: { message?: string } }) => {
        this.error = error.error?.message ?? 'Could not create the account.';
        this.busy = false;
      }
    });
  }
}
