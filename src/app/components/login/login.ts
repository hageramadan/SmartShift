import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule , FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  identifier = '';
  email = '';
  nickname = '';
  password = '';
  loading = false;

  constructor(private router: Router, private toastr: ToastrService, private authService: AuthService) {}

  login() {
    if(this.identifier.includes('@')) {
      this.email = this.identifier;
    } else {
      this.nickname = this.identifier;
    }

  this.loading = true;

  this.authService
    .login(this.password, this.email, this.nickname)
    .subscribe({
      next: (res) => {
        this.toastr.success(res.message || 'Login successful!');
        this.router.navigate(['/']);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.toastr.error(err?.error?.message || 'Login failed');
        this.loading = false;
      },
    });
}
}
