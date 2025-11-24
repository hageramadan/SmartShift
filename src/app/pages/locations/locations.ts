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

  // إضافة متغيرات للتحقق من الصحة
  formErrors = {
    name: '',
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  };

  // إضافة متغير لأخطاء الباك إند
  apiError = '';

  validationMessages = {
    name: {
      required: 'Location name is required',
      minlength: 'Location name must be at least 2 characters',
      maxlength: 'Location name cannot exceed 100 characters'
    },
    street: {
      required: 'Street address is required',
      minlength: 'Street address must be at least 5 characters',
      maxlength: 'Street address cannot exceed 200 characters'
    },
    city: {
      required: 'City is required',
      minlength: 'City name must be at least 2 characters',
      maxlength: 'City name cannot exceed 50 characters'
    },
    state: {
      required: 'State/Province is required',
      minlength: 'State/Province must be at least 2 characters',
      maxlength: 'State/Province cannot exceed 50 characters'
    },
    country: {
      required: 'Country is required'
    },
    postalCode: {
      required: 'Postal code is required',
      pattern: 'Postal code must be alphanumeric',
      maxlength: 'Postal code cannot exceed 20 characters'
    }
  };

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
          this.handleError('Failed to load locations', error);
        }
      })
    );
  }

  openModal(editLocation?: LocationI) {
    this.isModalOpen = true;
    this.clearFormErrors();
    this.apiError = ''; // تنظيف أخطاء الباك إند عند فتح المودال
    
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
    this.clearFormErrors();
    this.apiError = ''; // تنظيف أخطاء الباك إند عند إغلاق المودال
  }

  // التحقق من صحة البيانات
  validateForm(): boolean {
    this.clearFormErrors();
    let isValid = true;

    // التحقق من الاسم
    if (!this.newLocation.name || this.newLocation.name.trim().length === 0) {
      this.formErrors.name = this.validationMessages.name.required;
      isValid = false;
    } else if (this.newLocation.name.trim().length < 2) {
      this.formErrors.name = this.validationMessages.name.minlength;
      isValid = false;
    } else if (this.newLocation.name.trim().length > 100) {
      this.formErrors.name = this.validationMessages.name.maxlength;
      isValid = false;
    }

    // التحقق من الشارع
    if (!this.newLocation.street || this.newLocation.street.trim().length === 0) {
      this.formErrors.street = this.validationMessages.street.required;
      isValid = false;
    } else if (this.newLocation.street.trim().length < 5) {
      this.formErrors.street = this.validationMessages.street.minlength;
      isValid = false;
    } else if (this.newLocation.street.trim().length > 200) {
      this.formErrors.street = this.validationMessages.street.maxlength;
      isValid = false;
    }

    // التحقق من المدينة
    if (!this.newLocation.city || this.newLocation.city.trim().length === 0) {
      this.formErrors.city = this.validationMessages.city.required;
      isValid = false;
    } else if (this.newLocation.city.trim().length < 2) {
      this.formErrors.city = this.validationMessages.city.minlength;
      isValid = false;
    } else if (this.newLocation.city.trim().length > 50) {
      this.formErrors.city = this.validationMessages.city.maxlength;
      isValid = false;
    }

    // التحقق من المحافظة
    if (!this.newLocation.state || this.newLocation.state.trim().length === 0) {
      this.formErrors.state = this.validationMessages.state.required;
      isValid = false;
    } else if (this.newLocation.state.trim().length < 2) {
      this.formErrors.state = this.validationMessages.state.minlength;
      isValid = false;
    } else if (this.newLocation.state.trim().length > 50) {
      this.formErrors.state = this.validationMessages.state.maxlength;
      isValid = false;
    }

    // التحقق من الدولة
    if (!this.newLocation.country || this.newLocation.country.trim().length === 0) {
      this.formErrors.country = this.validationMessages.country.required;
      isValid = false;
    }

    // التحقق من الرمز البريدي
    if (!this.newLocation.postalCode || this.newLocation.postalCode.trim().length === 0) {
      this.formErrors.postalCode = this.validationMessages.postalCode.required;
      isValid = false;
    } else if (this.newLocation.postalCode.trim().length > 20) {
      this.formErrors.postalCode = this.validationMessages.postalCode.maxlength;
      isValid = false;
    } else if (!/^[a-zA-Z0-9\s\-]*$/.test(this.newLocation.postalCode)) {
      this.formErrors.postalCode = this.validationMessages.postalCode.pattern;
      isValid = false;
    }

    return isValid;
  }

  saveLocation() {
    if (!this.validateForm()) return;

    this.isLoading = true;
    this.apiError = ''; // تنظيف أخطاء الباك إند قبل المحاولة
    
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
            this.handleApiError('Failed to update location', error);
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
            this.handleApiError('Failed to create location', error);
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
          this.handleDeleteError(error);
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

  // معالجة الأخطاء من الباك إند للعمليات العامة
  private handleError(defaultMessage: string, error: any): void {
    console.error('❌ Error:', error);
    
    if (error.error && error.error.message) {
      this.toastr.error(error.error.message, 'Error');
    } else if (error.status === 0) {
      this.toastr.error('Network error: Please check your internet connection', 'Connection Error');
    } else if (error.status === 400) {
      this.toastr.error('Bad request: Please check your input data', 'Validation Error');
    } else if (error.status === 401) {
      this.toastr.error('Unauthorized: Please login again', 'Authentication Error');
    } else if (error.status === 403) {
      this.toastr.error('Forbidden: You do not have permission to perform this action', 'Permission Error');
    } else if (error.status === 404) {
      this.toastr.error('Resource not found', 'Not Found');
    } else if (error.status === 409) {
      this.toastr.error('Conflict: Location already exists', 'Duplicate Error');
    } else if (error.status === 500) {
      this.toastr.error('Server error: Please try again later', 'Server Error');
    } else {
      this.toastr.error(defaultMessage, 'Error');
    }
  }

  // معالجة أخطاء الباك إند للعمليات في المودال
  private handleApiError(defaultMessage: string, error: any): void {
    console.error('❌ API Error:', error);
    
    if (error.error && error.error.message) {
      // عرض الخطأ في المودال بدلاً من الـ toastr
      this.apiError = error.error.message;
    } else if (error.status === 0) {
      this.apiError = 'Network error: Please check your internet connection';
    } else if (error.status === 400) {
      this.apiError = 'Bad request: Please check your input data';
    } else if (error.status === 401) {
      this.apiError = 'Unauthorized: Please login again';
    } else if (error.status === 403) {
      this.apiError = 'Forbidden: You do not have permission to perform this action';
    } else if (error.status === 404) {
      this.apiError = 'Resource not found';
    } else if (error.status === 409) {
      this.apiError = 'Conflict: Location with this name already exists';
    } else if (error.status === 500) {
      this.apiError = 'Server error: Please try again later';
    } else {
      this.apiError = defaultMessage;
    }
  }

  // معالجة أخطاء الحذف بشكل خاص
  private handleDeleteError(error: any): void {
    if (error.error && error.error.message) {
      if (error.error.message.includes('assigned departments') || 
          error.error.message.includes('associated') ||
          error.error.message.includes('reference')) {
        this.deleteError = error.error.message;
        this.showDeleteErrorModal = true;
      } else {
        this.toastr.error(error.error.message, 'Delete Failed');
      }
    } else {
      this.handleError('Failed to delete location', error);
    }
  }

  // تنظيف أخطاء التحقق
  private clearFormErrors(): void {
    this.formErrors = {
      name: '',
      street: '',
      city: '',
      state: '',
      country: '',
      postalCode: ''
    };
  }
}