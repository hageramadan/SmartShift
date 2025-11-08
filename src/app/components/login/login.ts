import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  imports: [CommonModule , FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
 email = '';
  password = '';

  constructor(private router: Router, private toastr: ToastrService) {}

  login() {
    if (this.email === 'admin@hospital.com' && this.password === 'password123') {
      localStorage.setItem('isLoggedIn', 'true');
      this.toastr.success('Login successful!');
      this.router.navigate(['/dashboard']);
    } else {
      this.toastr.error('Invalid email or password');
    }
  }
}
