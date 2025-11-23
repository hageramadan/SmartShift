import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserProfileI } from '../../models/user-profile';
import { CrudService } from '../../services/crud.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  admin!: UserProfileI;
  tempAdmin!: UserProfileI;
  showEditForm = false;

  constructor(
    private toastr: ToastrService,
    private crud: CrudService
  ) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.crud.getAll<UserProfileI>('users/me').subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.admin = res.data;
          this.tempAdmin = { ...res.data };
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load profile');
      },
    });
  }

  openEditForm() {
    this.tempAdmin = { ...this.admin };
    this.showEditForm = true;
  }

  closeForm() {
    this.showEditForm = false;
  }


 saveChanges() {
  const body: any = {
    photo: this.tempAdmin.photo,
    firstName: this.tempAdmin.firstName,
    lastName: this.tempAdmin.lastName,
   
   
  
  };

   this.crud.customPatch<UserProfileI>('users/updateMe', body).subscribe({
    next: (res: any) => {
      if (res?.data) {
        this.admin = res.data;
        this.tempAdmin = { ...res.data };
      }
      this.showEditForm = false;
      this.toastr.success('Profile updated successfully');
    },
    error: (err) => {
      console.error(err);
      if (err?.error?.details) {
        this.toastr.error(`Failed: ${err.error.details.join(', ')}`);
      } else {
        this.toastr.error('Failed to update profile');
      }
    },
  });
  }
}
