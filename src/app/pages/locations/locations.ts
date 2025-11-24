import { Component, OnInit, OnDestroy } from '@angular/core';
import { LocationI } from '../../models/location-i';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from '../../services/crud.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-locations',
  imports: [CommonModule, FormsModule],
  templateUrl: './locations.html',
  styleUrl: './locations.css',
})
export class Locations implements OnInit, OnDestroy {
  locations: LocationI[] = [];
  
  // Form data - مطابق لهيكل API
  newLocation: any = {
    name: '',
    street: '',
    city: '',
    state: '',
    country: 'Egypt',
    postalCode: ''
  };

  isModalOpen = false;
  isEditing = false;
  editId: string = '';
  showDeleteConfirm = false;
  showDeleteErrorModal = false;
  locationToDelete: LocationI | null = null;
  isLoading = false;
  deleteError = '';

  private subscriptions: Subscription = new Subscription();

  constructor(
    private toastr: ToastrService,
    private crud: CrudService
  ) {}

  ngOnInit() {
    this.loadLocations();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadLocations() {
    this.isLoading = true;
    this.subscriptions.add(
      this.crud.getAll<any>('locations').subscribe({
        next: (response) => {
          this.isLoading = false;
          
          if (response && response.data) {
            this.locations = response.data;
          } else if (Array.isArray(response)) {
            this.locations = response;
          } else {
            this.locations = [];
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.toastr.error('Failed to load locations', 'Error');
          console.error('Error loading locations:', error);
        }
      })
    );
  }

  openModal(editLocation?: LocationI) {
    this.isModalOpen = true;
    if (editLocation) {
      this.newLocation = { 
        name: editLocation.name || '',
        street: editLocation.street || '',
        city: editLocation.city || '',
        state: editLocation.state || '',
        country: editLocation.country || 'Egypt',
        postalCode: editLocation.postalCode || ''
      };
      this.isEditing = true;
      this.editId = this.getLocationId(editLocation);
    } else {
      this.isEditing = false;
      this.editId = '';
      this.newLocation = {
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
    this.editId = '';
    this.newLocation = {
      name: '',
      street: '',
      city: '',
      state: '',
      country: 'Egypt',
      postalCode: ''
    };
  }

  validateForm(): boolean {
    const requiredFields = ['name', 'street', 'city', 'state', 'country', 'postalCode'];
    const missingFields = requiredFields.filter(field => !this.newLocation[field]);
    
    if (missingFields.length > 0) {
      this.toastr.warning('Please fill in all fields!', 'Validation');
      return false;
    }
    return true;
  }

  saveLocation() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    
    const locationData = {
      name: this.newLocation.name.trim(),
      street: this.newLocation.street.trim(),
      city: this.newLocation.city.trim(),
      state: this.newLocation.state.trim(),
      country: this.newLocation.country.trim(),
      postalCode: this.newLocation.postalCode.trim()
    };

    if (this.isEditing) {
      this.subscriptions.add(
        this.crud.update<any>('locations', this.editId, locationData).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.toastr.success('Location updated successfully!', 'Updated');
            this.loadLocations();
            this.closeModal();
          },
          error: (error) => {
            this.isLoading = false;
            this.toastr.error('Failed to update location', 'Error');
          }
        })
      );
    } else {
      this.subscriptions.add(
        this.crud.create<any>('locations', locationData).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.toastr.success('New location added!', 'Created');
            this.loadLocations();
            this.closeModal();
          },
          error: (error) => {
            this.isLoading = false;
            this.toastr.error('Failed to create location', 'Error');
          }
        })
      );
    }
  }

  confirmDelete(location: LocationI) {
    this.locationToDelete = location;
    this.showDeleteConfirm = true;
  }

  deleteLocation() {
    if (!this.locationToDelete) return;

    this.isLoading = true;
    const locationId = this.getLocationId(this.locationToDelete);
    
    this.subscriptions.add(
      this.crud.delete('locations', locationId).subscribe({
        next: (response: any) => {
          this.isLoading = false;
          this.toastr.success('Location deleted successfully!', 'Deleted');
          this.loadLocations();
          this.showDeleteConfirm = false;
          this.locationToDelete = null;
        },
        error: (error) => {
          this.isLoading = false;
          
          // معالجة الخطأ بناءً على الرسالة من الـ API
          if (error.error && error.error.message) {
            if (error.error.message.includes('assigned departments')) {
              // عرض modal خاص بالأخطاء بدل toastr عادي
              this.deleteError = error.error.message;
              this.showDeleteErrorModal = true;
            } else {
              this.toastr.error(error.error.message, 'Delete Failed');
            }
          } else {
            this.toastr.error('Failed to delete location', 'Error');
          }
          
          this.showDeleteConfirm = false;
          this.locationToDelete = null;
        }
      })
    );
  }

  cancelDelete() {
    this.showDeleteConfirm = false;
    this.locationToDelete = null;
  }

  closeErrorModal() {
    this.showDeleteErrorModal = false;
    this.deleteError = '';
  }

  // Helper function to get correct ID
  private getLocationId(location: LocationI): string {
    return location.id || location._id || '';
  }

  // Format address for display
  getFullAddress(location: LocationI): string {
    const parts = [location.street, location.city, location.state, location.country];
    return parts.filter(part => part && part.trim() !== '').join(', ');
  }
// Add these methods to your Locations class:

getUniqueCities(): string[] {
  const cities = this.locations.map(loc => loc.city).filter((city): city is string => !!city);
  return [...new Set(cities)];
}

getUniqueCountries(): string[] {
  const countries = this.locations.map(loc => loc.country).filter((country): country is string => !!country);
  return [...new Set(countries)];
}
  // Get display address (includes postal code)
  getDisplayAddress(location: LocationI): string {
    const baseAddress = this.getFullAddress(location);
    return location.postalCode ? `${baseAddress}, ${location.postalCode}` : baseAddress;
  }
}