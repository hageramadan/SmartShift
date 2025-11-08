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
   email: string = '';
  password: string = '';

  constructor(private router: Router, private toastr: ToastrService) {}

  login() {
    if (this.email === 'admin@hospital.com' && this.password === '123456') {
      this.toastr.success('Login successful! ', 'Success');
      localStorage.setItem('loggedIn', 'true');
      this.router.navigate(['/']);
    } else {
      this.toastr.error('Invalid email or password ', 'Login Failed');
    }
  }
}
