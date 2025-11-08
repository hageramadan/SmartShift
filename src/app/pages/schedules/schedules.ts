import { Component } from '@angular/core';
import { ScheduleI } from '../../models/schedule-i';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-schedules',
  imports: [CommonModule , FormsModule],
  templateUrl: './schedules.html',
  styleUrl: './schedules.css',
})
export class Schedules {
  schedules: ScheduleI[] = [
    {
      id: 1,
      user: 'Nurse Emily Rodriguez',
      role: 'Registered Nurse',
      department: 'Emergency Department',
      shift: 'Morning Shift',
      time: '07:00 - 15:00',
      date: '11/3/2025',
      status: 'scheduled',
    },
    {
      id: 2,
      user: 'Nurse Emily Rodriguez',
      role: 'Registered Nurse',
      department: 'Emergency Department',
      shift: 'Afternoon Shift',
      time: '15:00 - 23:00',
      date: '11/4/2025',
      status: 'scheduled',
    },
    {
      id: 3,
      user: 'Dr. Robert Brown',
      role: 'Attending Physician',
      department: 'Emergency Department',
      shift: 'Morning Shift',
      time: '07:00 - 15:00',
      date: '11/3/2025',
      status: 'scheduled',
    },
    {
      id: 4,
      user: 'Nurse Lisa Taylor',
      role: 'ICU Nurse',
      department: 'Intensive Care Unit',
      shift: 'ICU Day Shift',
      time: '08:00 - 20:00',
      date: '11/3/2025',
      status: 'scheduled',
    },
    {
      id: 5,
      user: 'Nurse Lisa Taylor',
      role: 'ICU Nurse',
      department: 'Intensive Care Unit',
      shift: 'ICU Night Shift',
      time: '20:00 - 08:00',
      date: '11/5/2025',
      status: 'scheduled',
    },
    {
      id: 6,
      user: 'Dr. Michael Chen',
      role: 'Emergency Department Manager',
      department: 'Emergency Department',
      shift: 'Morning Shift',
      time: '07:00 - 15:00',
      date: '11/5/2025',
      status: 'scheduled',
    },
  ];

  // Filters
  selectedDepartment = 'All Departments';
  selectedStatus = 'All Statuses';

  departments = ['All Departments', 'Emergency Department', 'Intensive Care Unit'];
  statuses = ['All Statuses', 'scheduled', 'completed', 'cancelled'];

  // Modal
  isModalOpen = false;
  isEditing = false;
  editId: number | null = null;
  showDeleteConfirm = false;
  scheduleToDelete: number | null = null;

  newSchedule: ScheduleI = {
    id: 0,
    user: '',
    role: '',
    department: '',
    shift: '',
    time: '',
    date: '',
    status: 'scheduled',
  };

  constructor(private toastr: ToastrService) {}

  get filteredSchedules(): ScheduleI[] {
    return this.schedules.filter((s) => {
      const deptMatch =
        this.selectedDepartment === 'All Departments' ||
        s.department === this.selectedDepartment;
      const statusMatch =
        this.selectedStatus === 'All Statuses' ||
        s.status === this.selectedStatus;
      return deptMatch && statusMatch;
    });
  }

  openModal(editSchedule?: ScheduleI) {
    this.isModalOpen = true;
    if (editSchedule) {
      this.isEditing = true;
      this.editId = editSchedule.id;
      this.newSchedule = { ...editSchedule };
    } else {
      this.isEditing = false;
      this.editId = null;
      this.newSchedule = {
        id: 0,
        user: '',
        role: '',
        department: '',
        shift: '',
        time: '',
        date: '',
        status: 'scheduled',
      };
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  validateForm(): boolean {
    if (
      !this.newSchedule.user ||
      !this.newSchedule.role ||
      !this.newSchedule.department ||
      !this.newSchedule.shift ||
      !this.newSchedule.time ||
      !this.newSchedule.date
    ) {
      this.toastr.warning('Please fill all fields!', 'Validation');
      return false;
    }
    return true;
  }

  saveSchedule() {
    if (!this.validateForm()) return;

    if (this.isEditing) {
      const index = this.schedules.findIndex((s) => s.id === this.editId);
      if (index > -1) {
        this.schedules[index] = { ...this.newSchedule };
        this.toastr.info('Schedule updated successfully!');
      }
    } else {
      this.newSchedule.id = Date.now();
      this.schedules.push({ ...this.newSchedule });
      this.toastr.success('Schedule created successfully!');
    }
    this.closeModal();
  }

  confirmDelete(id: number) {
    this.scheduleToDelete = id;
    this.showDeleteConfirm = true;
  }

  deleteSchedule() {
    if (this.scheduleToDelete != null) {
      this.schedules = this.schedules.filter(
        (s) => s.id !== this.scheduleToDelete
      );
      this.toastr.error('Schedule deleted!', 'Deleted');
      this.showDeleteConfirm = false;
      this.scheduleToDelete = null;
    }
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
  }


}
