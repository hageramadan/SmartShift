import { Component, OnInit } from '@angular/core';
import { LocationI } from '../../models/location-i';
import { DepartmentI } from '../../models/department-i';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from '../../services/crud.service';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-locations',
  imports: [CommonModule, FormsModule],
  templateUrl: './locations.html',
  styleUrl: './locations.css',
})
export class Locations implements OnInit {
  locations: LocationI[] = [];
  departments: DepartmentI[] = [];
  
  newLocation: LocationI = {
    id: 0,
    name: '',
    street: '',
    city: '',
    state: '',
    country: 'Egypt',
    postalCode: ''
  };
  
  isModalOpen = false;
  isEditing = false;
  editId: number | null = null;
  showDeleteConfirm = false;
  locationToDelete: number | null = null;
  isLoading = false;

  constructor(
    private toastr: ToastrService,
    private crudService: CrudService,
    private sharedService: SharedService
  ) {}

  ngOnInit() {
    this.loadLocations();
    this.loadDepartments();
  }

  loadLocations() {
    this.isLoading = true;
    this.crudService.getAll('locations').subscribe({
      next: (res: any) => {
        this.locations = res.data || res;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading locations:', err);
        this.toastr.error('Error loading locations!', 'Error');
        this.isLoading = false;
      }
    });
  }

  loadDepartments() {
    this.sharedService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
      },
      error: (err) => {
        console.error('Error loading departments:', err);
      }
    });
  }

  openModal(editLocation?: LocationI) {
    this.isModalOpen = true;
    if (editLocation) {
      this.newLocation = { ...editLocation };
      this.isEditing = true;
      this.editId = editLocation.id;
    } else {
      this.isEditing = false;
      this.editId = null;
      this.newLocation = {
        id: 0,
        name: '',
        street: '',
        city: '',
        state: '',
        country: 'Egypt',
        postalCode: ''
      };
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditing = false;
    this.editId = null;
    this.newLocation = {
      id: 0,
      name: '',
      street: '',
      city: '',
      state: '',
      country: 'Egypt',
      postalCode: ''
    };
  }

  validateForm(): boolean {
    if (!this.newLocation.name || 
        !this.newLocation.street || 
        !this.newLocation.city || 
        !this.newLocation.state || 
        !this.newLocation.country) {
      this.toastr.warning('Please fill in all required fields!', 'Validation');
      return false;
    }
    return true;
  }

  saveLocation() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    const locationData = {
      name: this.newLocation.name,
      street: this.newLocation.street,
      city: this.newLocation.city,
      state: this.newLocation.state,
      country: this.newLocation.country,
      postalCode: this.newLocation.postalCode || ''
    };

    if (this.isEditing && this.editId) {
      // Update location
      this.crudService.update('locations', this.editId.toString(), locationData).subscribe({
        next: (res: any) => {
          this.toastr.success('Location updated successfully!', 'Updated');
          this.loadLocations();
          this.closeModal();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error updating location:', err);
          this.toastr.error('Error updating location!', 'Error');
          this.isLoading = false;
        }
      });
    } else {
      // Create new location
      this.crudService.create('locations', locationData).subscribe({
        next: (res: any) => {
          this.toastr.success('New location added successfully!', 'Created');
          this.loadLocations();
          this.closeModal();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error adding location:', err);
          this.toastr.error('Error adding location!', 'Error');
          this.isLoading = false;
        }
      });
    }
  }

  confirmDelete(id: number) {
    this.locationToDelete = id;
    this.showDeleteConfirm = true;
  }

  deleteLocation() {
    if (this.locationToDelete !== null) {
      this.isLoading = true;
      this.crudService.delete('locations', this.locationToDelete.toString()).subscribe({
        next: (res: any) => {
          this.toastr.success('Location deleted successfully!', 'Deleted');
          this.loadLocations();
          this.showDeleteConfirm = false;
          this.locationToDelete = null;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error deleting location:', err);
          this.toastr.error('Error deleting location!', 'Error');
          this.isLoading = false;
        }
      });
    }
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.locationToDelete = null;
  }

  // Helper function to format address for display
  getFullAddress(location: LocationI): string {
    const parts = [
      location.street,
      location.city,
      location.state,
      location.postalCode,
      location.country
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  }
}