import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserProfileI } from '../../models/user-profile';
import { CrudService } from '../../services/crud.service';
import { SharedService } from '../../services/shared.service';
import { DepartmentI } from '../../models/department-i';
import { PositionI } from '../../models/position-i';
import { LevelI } from '../../models/level-i';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class Profile implements OnInit {
  admin!: UserProfileI;
  tempAdmin!: any; // استخدام any للسماح بالتعديل المؤقت
  showEditForm = false;

  // القوائم للـ select boxes
  departments: DepartmentI[] = [];
  positions: PositionI[] = [];
  levels: LevelI[] = [];
  roles: string[] = ['user', 'manager', 'admin'];

  // Loading state
  isLoading = false;

  constructor(
    private toastr: ToastrService,
    private crud: CrudService,
    private sharedSrv: SharedService
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.loadSharedData();
  }

  loadProfile() {
    this.crud.getAll<UserProfileI>('users/me').subscribe({
      next: (res: any) => {
        if (res?.data) {
          this.admin = res.data;
          // إنشاء نسخة للتعديل مع الحفاظ على الهيكل
          this.tempAdmin = {
            ...res.data,
            departmentId: res.data.department?._id || '',
            positionId: res.data.position?._id || '',
            levelId: res.data.level?._id || '',
            role: res.data.role || 'user'
          };
        }
      },
      error: (err) => {
        console.error(err);
        this.toastr.error('Failed to load profile');
      },
    });
  }

  loadSharedData() {
    this.sharedSrv.loadAll();

    this.sharedSrv.getDepartments().subscribe((depts) => {
      this.departments = depts;
    });

    this.sharedSrv.getPositions().subscribe((positions) => {
      this.positions = positions;
    });

    this.sharedSrv.getLevels().subscribe((levels) => {
      this.levels = levels;
    });
  }

  openEditForm() {
    // إنشاء نسخة للتعديل مع الحفاظ على الهيكل
    this.tempAdmin = {
      ...this.admin,
      departmentId: this.admin.department?._id || '',
      positionId: this.admin.position?._id || '',
      levelId: this.admin.level?._id || '',
      role: this.admin.role || 'user'
    };
    this.showEditForm = true;
  }

  closeForm() {
    this.showEditForm = false;
  }

  saveChanges() {
    this.isLoading = true;

    const body: any = {
      photo: this.tempAdmin.photo,
      firstName: this.tempAdmin.firstName,
      lastName: this.tempAdmin.lastName,
      nickname: this.tempAdmin.nickname,
      // role: this.tempAdmin.role,
      // departmentId: this.tempAdmin.departmentId,
      // positionId: this.tempAdmin.positionId,
      // levelId: this.tempAdmin.levelId
    };

    // إزالة الحقول الفارغة
    Object.keys(body).forEach(key => {
      if (body[key] === null || body[key] === undefined || body[key] === '') {
        delete body[key];
      }
    });

    console.log('Updating profile with:', body);

    this.crud.customPatch<UserProfileI>('users/updateMe', body).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.data) {
          this.admin = res.data;
          this.toastr.success('Profile updated successfully');
          this.showEditForm = false;
          
          // إعادة تحميل البيانات للحصول على أحدث التحديثات
          this.loadProfile();
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Update error:', err);
        this.handleError(err);
      },
    });
  }

  private handleError(err: any) {
    let errorMessage = 'Failed to update profile';
    
    if (err?.error?.details) {
      if (Array.isArray(err.error.details)) {
        errorMessage = `Failed: ${err.error.details.join(', ')}`;
      } else if (typeof err.error.details === 'string') {
        errorMessage = err.error.details;
      } else if (typeof err.error.details === 'object') {
        errorMessage = this.formatObjectErrors(err.error.details);
      }
    } else if (err?.error?.message) {
      errorMessage = err.error.message;
    }
    
    this.toastr.error(errorMessage);
  }

  private formatObjectErrors(errorObj: any): string {
    if (!errorObj) return '';
    
    const errors: string[] = [];
    
    for (const [field, messages] of Object.entries(errorObj)) {
      if (Array.isArray(messages)) {
        errors.push(`${field}: ${messages.join(', ')}`);
      } else {
        errors.push(`${field}: ${messages}`);
      }
    }
    
    return errors.join('; ');
  }

  // Helper functions for template
  getSelectedDepartmentName(): string {
    if (!this.tempAdmin?.departmentId) return 'Not selected';
    const dept = this.departments.find(d => d._id === this.tempAdmin.departmentId);
    return dept ? dept.name : 'Unknown';
  }

  getSelectedPositionName(): string {
    if (!this.tempAdmin?.positionId) return 'Not selected';
    const position = this.positions.find(p => p._id === this.tempAdmin.positionId);
    return position ? position.name : 'Unknown';
  }

  getSelectedLevelName(): string {
    if (!this.tempAdmin?.levelId) return 'Not selected';
    const level = this.levels.find(l => l._id === this.tempAdmin.levelId);
    return level ? level.name : 'Unknown';
  }
}