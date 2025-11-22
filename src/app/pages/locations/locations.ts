import { Component } from '@angular/core';
import { LocationI } from '../../models/location-i';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { DepartmentI } from '../../models/department-i';
@Component({
  selector: 'app-locations',
  imports: [CommonModule , FormsModule],
  templateUrl: './locations.html',
  styleUrl: './locations.css',
})
export class Locations {
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
 departments: DepartmentI[] = [

    // // your department data here
    //   {
    //       id: 1,
    //       name: 'Emergency Department',
    //       description: 'Handles all emergency and urgent care patients',
    //       manager: 'Dr. Michael Chen',
    //       staffCount: 4,
    //     },
    //     {
    //       id: 2,
    //       name: 'Intensive Care Unit',
    //       description: 'Critical care for severely ill patients',
    //       manager: 'Dr. James Wilson',
    //       staffCount: 2,
    //     },
    //     {
    //       id: 3,
    //       name: 'Surgery Department',
    //       description: 'Surgical procedures and post-operative care',
    //       manager: 'Dr. Sarah Johnson',
    //       staffCount: 0,
    //     },
  ];
  // newLocation: LocationI = { id: 0, name: '', address: '', department: '' };
  isModalOpen = false;
  isEditing = false;
  editId: string ='';
  showDeleteConfirm = false;
  locationToDelete: string | null = null;

  constructor(private toastr: ToastrService) {}

  openModal(editLocation?: LocationI) {
    this.isModalOpen = true;
    if (editLocation) {
      // this.newLocation = { ...editLocation };
      this.isEditing = true;
      this.editId = editLocation.id||'';
    } else {
      this.isEditing = false;
      // this.newLocation = { id: 0, name: '', address: '', department: '' };
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditing = false;
    this.editId = '';
    // this.newLocation = { id: 0, name: '', address: '', department: '' };
  }

  validateForm(): boolean {
    // if (!this.newLocation.name || !this.newLocation.address || !this.newLocation.department) {
    //   this.toastr.warning('Please fill in all fields!', 'Validation');
    //   return false;
    // }
    return true;
  }

  saveLocation() {
    if (!this.validateForm()) return;

    if (this.isEditing) {
      const index = this.locations.findIndex((l) => l.id === this.editId);
      if (index > -1) {
        // this.locations[index] = { ...this.newLocation };
        this.toastr.info('Location updated successfully!', 'Updated');
      }
    } else {
      // this.newLocation.id = Date.now();
      // this.locations.push({ ...this.newLocation });
      this.toastr.success('New location added!', 'Created');
    }
    this.closeModal();
  }

  confirmDelete(id: string) {
    this.locationToDelete = id;
    this.showDeleteConfirm = true;
  }

  deleteLocation() {
    if (this.locationToDelete != null) {
      this.locations = this.locations.filter((l) => l.id !== this.locationToDelete);
      this.toastr.error('Location deleted successfully!', 'Deleted');
      this.showDeleteConfirm = false;
      this.locationToDelete = null;
    }
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.locationToDelete = null;
  }
}
