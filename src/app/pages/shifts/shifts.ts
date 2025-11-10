import { Component } from '@angular/core';
import { ShiftI } from '../../models/shift-i';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentI } from '../../models/department-i';
import { LocationI } from '../../models/location-i';
import { SubDepartmentI } from '../../models/sub-department-i';

@Component({
  selector: 'app-shifts',
  imports: [CommonModule, FormsModule],
  templateUrl: './shifts.html',
  styleUrls: ['./shifts.css'],
})
export class Shifts {
  // ====== Data ======
  departments: DepartmentI[] = [
    // {
    //   id: 1,
    //   name: 'Emergency Department',
    //   description: 'Handles all emergency and urgent care patients',
    //   manager: 'Dr. Michael Chen',
    //   staffCount: 4,
    // },
    // {
    //   id: 2,
    //   name: 'Intensive Care Unit',
    //   description: 'Critical care for severely ill patients',
    //   manager: 'Dr. James Wilson',
    //   staffCount: 2,
    // },
    // {
    //   id: 3,
    //   name: 'Surgery Department',
    //   description: 'Surgical procedures and post-operative care',
    //   manager: 'Dr. Sarah Johnson',
    //   staffCount: 0,
    // },
  ];

  locations: LocationI[] = [
    // {
    //   id: 1,
    //   name: 'Main Hospital Building - Wing A',
    //   address: '123 Medical Center Drive, Floor 1',
    //   department: 'Emergency Department',
    // },
    // {
    //   id: 2,
    //   name: 'Main Hospital Building - Wing B',
    //   address: '123 Medical Center Drive, Floor 3',
    //   department: 'Intensive Care Unit',
    // },
    // {
    //   id: 3,
    //   name: 'Surgery Center',
    //   address: '456 Healthcare Blvd',
    //   department: 'Surgery Department',
    // },
  ];

  subDepartments: SubDepartmentI[] = [
    // {
    //   id: 1,
    //   name: 'Trauma Unit',
    //   parentId: this.findDepartmentIdByName('Emergency Department'),
    //   description: 'Specializes in trauma and severe injuries',
    // },
    // {
    //   id: 2,
    //   name: 'Pediatric Emergency',
    //   parentId: this.findDepartmentIdByName('Emergency Department'),
    //   description: 'Emergency care for children',
    // },
    // {
    //   id: 3,
    //   name: 'Cardiac ICU',
    //   parentId: this.findDepartmentIdByName('Intensive Care Unit'),
    //   description: 'Intensive care for cardiac patients',
    // },
    // {
    //   id: 4,
    //   name: 'Neuro ICU',
    //   parentId: this.findDepartmentIdByName('Intensive Care Unit'),
    //   description: 'Intensive care for neurological patients',
    // },
  ];

  shifts: ShiftI[] = [
    // {
    //   id: 1,
    //   name: 'Morning Shift',
    //   time: '07:00 - 15:00',
    //   startTime: '07:00',
    //   endTime: '15:00',
    //   department: 'Emergency Department',
    //   subDepartment: 'Trauma Unit',
    //   location: 'Main Hospital Building - Wing A',
    //   registerConfig: 'Check-In / Check-Out (Early: 15m)',
    // },
    // {
    //   id: 2,
    //   name: 'Afternoon Shift',
    //    time: '07:00 - 15:00',
    //   startTime: '15:00',
    //   endTime: '23:00',
    //   department: 'Emergency Department',
    //   subDepartment: 'Trauma Unit',
    //   location: 'Main Hospital Building - Wing A',
    //   registerConfig: 'Check-In / Check-Out (Early: 15m)',
    // },
  ];

  newShift: ShiftI = {
    id: 0,
    name: '',
    startTime: '',
     time: '',
    endTime: '',
    department: '',
    subDepartment: '',
    location: '',
    registerConfig: '',
    checkInStart: false,
    checkOutEnd: false,
    earlyCheckIn: false,
  };

  isModalOpen = false;
  isEditing = false;
  editId: number | null = null;
  showDeleteConfirm = false;
  shiftToDelete: number | null = null;

  constructor(private toastr: ToastrService) {}

  // ====== Methods ======
  findDepartmentIdByName(departmentName: string): string | null {
    const department = this.departments.find((d) => d.name === departmentName);
    return department ? department._id : null;
  }

  openModal(editShift?: ShiftI) {
    this.isModalOpen = true;
    if (editShift) {
      this.newShift = { ...editShift };
      this.isEditing = true;
      this.editId = editShift.id;
    } else {
      this.isEditing = false;
      this.newShift = {
        id: 0,
        name: '',
        startTime: '',
        endTime: '',
        department: '',
        subDepartment: '',
        location: '',
        registerConfig: '',
        checkInStart: false,
        checkOutEnd: false,
        earlyCheckIn: false,
      };
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditing = false;
    this.editId = null;
    this.newShift = {
      id: 0,
      name: '',
       time: '',
      startTime: '',
      endTime: '',
      department: '',
      subDepartment: '',
      location: '',
      registerConfig: '',
      checkInStart: false,
      checkOutEnd: false,
      earlyCheckIn: false,
    };
  }

  validateForm(): boolean {
    if (
      !this.newShift.name ||
      !this.newShift.department ||
      !this.newShift.subDepartment ||
      !this.newShift.location ||
      !this.newShift.startTime ||
      !this.newShift.endTime
    ) {
      this.toastr.warning('Please fill in all required fields!', 'Validation');
      return false;
    }
    return true;
  }

  saveShift() {
    if (!this.validateForm()) return;

    // تحويل checkboxes إلى نص
    const registerArr = [];
    if (this.newShift.checkInStart) registerArr.push('Check in at shift start');
    if (this.newShift.checkOutEnd) registerArr.push('Check out at shift end');
    if (this.newShift.earlyCheckIn) registerArr.push('Early check in allowed');
    this.newShift.registerConfig = registerArr.join(' / ');

    if (this.isEditing) {
      const index = this.shifts.findIndex((s) => s.id === this.editId);
      if (index > -1) {
        this.shifts[index] = { ...this.newShift };
        this.toastr.info('Shift updated successfully!', 'Updated');
      }
    } else {
      this.newShift.id = Date.now();
      this.shifts.push({ ...this.newShift });
      this.toastr.success('New shift added!', 'Created');
    }
    this.closeModal();
  }

  confirmDelete(id: number) {
    this.shiftToDelete = id;
    this.showDeleteConfirm = true;
  }

  deleteShift() {
    if (this.shiftToDelete != null) {
      this.shifts = this.shifts.filter((s) => s.id !== this.shiftToDelete);
      this.toastr.error('Shift deleted successfully!', 'Deleted');
      this.showDeleteConfirm = false;
      this.shiftToDelete = null;
    }
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.shiftToDelete = null;
  }
}
