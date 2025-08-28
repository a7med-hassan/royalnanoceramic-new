import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(private router: Router) {}

  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Simulate API call delay
    setTimeout(() => {
      if (this.username === 'ahmed' && this.password === '123456') {
        // Store login state
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUser', this.username);

        // Navigate to admin dashboard
        this.router.navigate(['/admin/dashboard']);
      } else {
        this.errorMessage = 'Invalid credentials';
        this.isLoading = false;
      }
    }, 1000);
  }

  // Hide password in console/logs
  getPasswordDisplay(): string {
    return '••••••';
  }
}
