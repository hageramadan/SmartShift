import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudService } from '../../services/crud.service';
import { SharedService } from '../../services/shared.service';
import { PositionI } from '../../models/position-i';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-postions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './postions.html',
  styleUrls: ['./postions.css']
})
export class Postions implements OnInit, OnDestroy {
  positions: PositionI[] = [];
  filteredPositions: PositionI[] = [];
  loading = false;
  showForm = false;
  showDeleteConfirm = false;
  editingPosition: PositionI | null = null;
  deletePositionId: string | null = null;
  deletePositionName = '';
  
  // Search
  searchTerm = '';
  
  positionName = '';

  // إضافة متغيرات للتحقق من الصحة
  formErrors = {
    name: ''
  };

  apiError = '';
  showDeleteErrorModal = false;
  deleteError = '';

  validationMessages = {
    name: {
      required: 'Position name is required',
      minlength: 'Position name must be at least 2 characters',
      maxlength: 'Position name cannot exceed 100 characters',
      pattern: 'Position name can only contain letters, and spaces'
    }
  };

  private subscriptions: Subscription = new Subscription();

  constructor(
    private crud: CrudService,
    private shared: SharedService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadPositions();
    this.subscriptions.add(
      this.shared.getPositions().subscribe(positions => {
        this.positions = positions;
        this.filteredPositions = positions;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  loadPositions(): void {
    this.loading = true;
    this.shared.refetchAll();
    this.loading = false;
  }

  // Search Functions
  onSearch(): void {
    this.applySearch();
  }

  applySearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPositions = this.positions;
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredPositions = this.positions.filter(position => 
      position.name.toLowerCase().includes(term)
    );
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.filteredPositions = this.positions;
  }

  hasActiveSearch(): boolean {
    return !!this.searchTerm;
  }

  refreshData(): void {
    this.loading = true;
    this.shared.refetchAll();
    setTimeout(() => {
      this.loading = false;
      this.toastr.success('Data refreshed successfully');
    }, 1000);
  }

  // Form Functions
  openAddForm(): void {
    this.showForm = true;
    this.editingPosition = null;
    this.positionName = '';
    this.clearFormErrors();
    this.apiError = '';
  }

  openEditForm(position: PositionI): void {
    this.showForm = true;
    this.editingPosition = position;
    this.positionName = position.name;
    this.clearFormErrors();
    this.apiError = '';
  }

  closeForm(): void {
    this.showForm = false;
    this.editingPosition = null;
    this.positionName = '';
    this.clearFormErrors();
    this.apiError = '';
  }

  // التحقق من صحة البيانات
  validateForm(): boolean {
    this.clearFormErrors();
    let isValid = true;

    // التحقق من الاسم
    if (!this.positionName || this.positionName.trim().length === 0) {
      this.formErrors.name = this.validationMessages.name.required;
      isValid = false;
    } else if (this.positionName.trim().length < 2) {
      this.formErrors.name = this.validationMessages.name.minlength;
      isValid = false;
    } else if (this.positionName.trim().length > 100) {
      this.formErrors.name = this.validationMessages.name.maxlength;
      isValid = false;
    } else if (!/^[a-zA-Z\u0600-\u06FF\s\-_&]+$/.test(this.positionName)) {
      this.formErrors.name = this.validationMessages.name.pattern;
      isValid = false;
    }

    return isValid;
  }

  submitForm(): void {
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    this.apiError = '';

    const positionData = { 
      name: this.positionName.trim() 
    };

    if (this.editingPosition) {
      this.subscriptions.add(
        this.crud.update<PositionI>('positions', this.editingPosition._id!, positionData)
          .subscribe({
            next: (response) => {
              this.loading = false;
              this.toastr.success('Position updated successfully');
              this.closeForm();
              this.loadPositions();
            },
            error: (error) => {
              this.loading = false;
              this.handleApiError('Failed to update position', error);
            }
          })
      );
    } else {
      this.subscriptions.add(
        this.crud.create<PositionI>('positions', positionData)
          .subscribe({
            next: (response) => {
              this.loading = false;
              this.toastr.success('Position created successfully');
              this.closeForm();
              this.loadPositions();
            },
            error: (error) => {
              this.loading = false;
              this.handleApiError('Failed to create position', error);
            }
          })
      );
    }
  }

  deletePosition(position: PositionI): void {
    this.showDeleteConfirm = true;
    this.deletePositionId = position._id!;
    this.deletePositionName = position.name;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.deletePositionId = null;
    this.deletePositionName = '';
  }

  confirmDelete(): void {
    if (!this.deletePositionId) return;

    this.loading = true;
    
    this.subscriptions.add(
      this.crud.delete('positions', this.deletePositionId)
        .subscribe({
          next: () => {
            this.loading = false;
            this.toastr.success('Position deleted successfully');
            this.loadPositions();
            this.cancelDelete();
          },
          error: (error) => {
            this.loading = false;
            this.handleDeleteError(error);
            this.cancelDelete();
          }
        })
    );
  }

  closeErrorModal(): void {
    this.showDeleteErrorModal = false;
    this.deleteError = '';
  }

  // معالجة الأخطاء من الباك إند
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
      this.apiError = 'Position not found';
    } else if (error.status === 409) {
      this.apiError = 'Conflict: Position with this name already exists';
    } else if (error.status === 500) {
      this.apiError = 'Server error: Please try again later';
    } else {
      this.apiError = defaultMessage;
    }
  }

  // معالجة أخطاء الحذف بشكل خاص
  private handleDeleteError(error: any): void {
    if (error.error && error.error.message) {
      if (error.error.message.includes('assigned employees') || 
          error.error.message.includes('associated') ||
          error.error.message.includes('reference') ||
          error.error.message.includes('users') ||
          error.error.message.includes('employees')) {
        this.deleteError = error.error.message;
        this.showDeleteErrorModal = true;
      } else {
        this.toastr.error(error.error.message, 'Delete Failed');
      }
    } else {
      this.toastr.error('Failed to delete position', 'Error');
    }
  }

  // تنظيف أخطاء التحقق
  private clearFormErrors(): void {
    this.formErrors = {
      name: ''
    };
  }
}