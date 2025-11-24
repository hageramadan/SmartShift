import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from '../../services/crud.service';

interface Department {
  _id: string;
  name: string;
}

interface SubDepartment {
  _id: string;
  name: string;
}

interface Location {
  _id?: string;
  name: string;
}

interface Shift {
  id?: string;
  shiftName?: string;
  shiftType?: string;
  startTimeFormatted?: string;
  endTimeFormatted?: string;
  department?: Department | null;
  subDepartment?: SubDepartment | null;
  location?: Location | null;
  checkInStart?: boolean;
  checkOutEnd?: boolean;
  earlyCheckIn?: boolean;
}

@Component({
  selector: 'app-shifts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shifts.html',
  styleUrls: ['./shifts.css'],
})
export class Shifts implements OnInit {
  shifts: Shift[] = [];
  departments: Department[] = [];
  subDepartments: SubDepartment[] = [];
  locations: Location[] = [];

  isModalOpen = false;
  isEditing = false;
  showDeleteConfirm = false;
  shiftToDeleteId: string | null = null;

  newShift: Partial<Shift> = {};

  constructor(
    private toastr: ToastrService,
    private crud: CrudService
  ) {}

  ngOnInit() {
    this.fetchSharedData();
    this.fetchShifts();
  }

  fetchSharedData() {
    // جلب الـ departments, subDepartments, locations مباشرة
    this.crud.getAll<Department>('departments').subscribe({
      next: res => this.departments = res.data ?? [],
      error: () => this.toastr.error('Failed to fetch departments')
    });

    this.crud.getAll<SubDepartment>('subdepartments').subscribe({
      next: res => this.subDepartments = res.data ?? [],
      error: () => this.toastr.error('Failed to fetch subDepartments')
    });

    this.crud.getAll<Location>('locations').subscribe({
      next: res => this.locations = res.data ?? [],
      error: () => this.toastr.error('Failed to fetch locations')
    });
  }

  fetchShifts() {
    this.crud.getAll<Shift>('shifts').subscribe({
      next: res => this.shifts = res.data ?? [],
      error: () => this.toastr.error('Failed to fetch shifts')
    });
  }

  addShift() {
    this.isModalOpen = true;
    this.isEditing = false;
    this.newShift = {
      shiftName: '',
      shiftType: '',
      department: null,
      subDepartment: null,
      location: null,
      checkInStart: false,
      checkOutEnd: false,
      earlyCheckIn: false
    };
  }

  editShift(shift: Shift) {
    this.isModalOpen = true;
    this.isEditing = true;
    this.newShift = { ...shift };
  }

  saveShift() {
    const payload: any = { ...this.newShift };

    if (this.isEditing && this.newShift.id) {
      this.crud.update<Shift>('shifts', this.newShift.id, payload).subscribe({
        next: res => {
          const idx = this.shifts.findIndex(s => s.id === res.data.id);
          if (idx !== -1) this.shifts[idx] = res.data;
          this.toastr.success('Shift updated');
          this.closeModal();
        },
        error: () => this.toastr.error('Update failed')
      });
    } else {
      this.crud.create<Shift>('shifts', payload).subscribe({
        next: res => {
          this.shifts = [res.data, ...this.shifts];
          this.toastr.success('Shift created');
          this.closeModal();
        },
        error: () => this.toastr.error('Create failed')
      });
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.newShift = {};
    this.isEditing = false;
  }

  // confirmDelete(id: string) {
  //   this.showDeleteConfirm = true;
  //   this.shiftToDeleteId = id;
  // }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.shiftToDeleteId = null;
  }

  deleteShiftConfirmed() {
    if (!this.shiftToDeleteId) return;

    this.crud.delete<Shift>('shifts', this.shiftToDeleteId).subscribe({
      next: () => {
        this.shifts = this.shifts.filter(s => s.id !== this.shiftToDeleteId);
        this.toastr.info('Shift deleted');
        this.cancelDelete();
      },
      error: () => this.toastr.error('Delete failed')
    });
  }
  confirmDelete(id?: string) {
  if (!id) return; 
  this.showDeleteConfirm = true;
  this.shiftToDeleteId = id;
}

}
