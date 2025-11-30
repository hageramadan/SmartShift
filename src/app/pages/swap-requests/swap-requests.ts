import { Component, OnInit, OnDestroy } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SwapRequestI } from '../../models/swap-request-i';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedService } from '../../services/shared.service';
import { SwapService } from '../../services/swap.service';
import { Subject, takeUntil } from 'rxjs';
import { DepartmentI } from '../../models/department-i';
import { AuthService } from '../../services/auth.service';

type SwapStatus = 'all' | 'pending' | 'approved' | 'rejected';

@Component({
  selector: 'app-swap-requests',
  templateUrl: './swap-requests.html',
  styleUrls: ['./swap-requests.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SwapRequests implements OnInit, OnDestroy {
  requests: SwapRequestI[] = [];
  allRequests: SwapRequestI[] = [];
  departments: DepartmentI[] = [];

  search = '';
  status: SwapStatus = 'all';
  departmentId = 'all';

  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  totalItems = 0;

  isLoading = false;
  isDataLoading = true;

  private destroy$ = new Subject<void>();
  private searchTimeout: any;
  currentUserRole: string = 'user';
  currentUserDeptId: string | null = null;
  isDepartmentFilterDisabled = false;
  constructor(
    private toastr: ToastrService,
    private swapService: SwapService,
    public shared: SharedService,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (user) {
      this.currentUserRole = user.role;
      if (user.role === 'manager') {
        this.currentUserDeptId = user.departmentId || null;
        this.departmentId = this.currentUserDeptId || 'all';
        this.isDepartmentFilterDisabled = true; // disable UI filter
      }
    }
    this.loadSharedData();
    this.subscribeToSwapService();
    this.loadRequestsFromBackend();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Load departments */
  loadSharedData(): void {
    this.shared.loadAll();
    this.shared.getDepartments()
      .pipe(takeUntil(this.destroy$))
      .subscribe(deps => this.departments = deps);
  }

  /** Subscribe to SwapService observables */
  subscribeToSwapService(): void {
    this.swapService.requests
      .pipe(takeUntil(this.destroy$))
      .subscribe(reqs => {
        this.allRequests = reqs;

        if (this.search.trim()) {
          this.applyFrontendSearch();
        } else {
          this.requests = reqs;
          this.totalItems = this.swapService['meta$'].value.totalFiltered || reqs.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        }
      });

    this.swapService.meta
      .pipe(takeUntil(this.destroy$))
      .subscribe(meta => {
        if (!this.search.trim()) {
          this.totalItems = meta.totalFiltered;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        }
      });

    this.swapService.loading
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.isDataLoading = loading);
  }

  /** Debounced search */
  onSearchDebounced(): void {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => this.applyFrontendSearch(), 300);
  }

  /** Load requests from backend */
  loadRequestsFromBackend(page: number = 1): void {
    const filters: any = {
      page,
      limit: this.pageSize,
      status: this.status !== 'all' ? this.status : undefined,
      departmentId: this.currentUserRole === 'manager' ? this.currentUserDeptId : (this.departmentId !== 'all' ? this.departmentId : undefined),
    };
    this.swapService.setFilters(filters);
  }

  /** Apply frontend search */
  applyFrontendSearch(): void {
    if (!this.search.trim()) {
      this.requests = [...this.allRequests];
      this.totalItems = this.swapService['meta$'].value.totalFiltered || this.requests.length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    } else {
      const s = this.search.toLowerCase().trim();
      this.requests = this.allRequests.filter(r =>
        (this.getFullName(r.fromUser) + this.getFullName(r.toUser) + this.getShiftName(r.fromSchedule) + this.getShiftName(r.toSchedule) + this.getDepartmentName(r.fromSchedule) + (r.message || ''))
          .toLowerCase()
          .includes(s)
      );
      this.currentPage = 1;
      this.totalItems = this.requests.length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    }
  }

  /** Filter changes */
  onStatusChange(): void { this.currentPage = 1; this.loadRequestsFromBackend(); }
  onDepartmentChange(): void { this.currentPage = 1; this.loadRequestsFromBackend(); }
  clearFilters(): void { this.search = ''; this.status = 'all'; this.departmentId = 'all'; this.currentPage = 1; this.loadRequestsFromBackend(); }

  /** Pagination helpers */
  get paginatedRequests(): SwapRequestI[] {
    if (this.search.trim()) {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.requests.slice(start, start + this.pageSize);
    } else return this.requests;
  }
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }
  goToPage(page: number): void {
    this.currentPage = page;
    if (!this.search.trim()) this.loadRequestsFromBackend(page);
  }
  previousPage(): void { if (this.currentPage > 1) this.goToPage(this.currentPage - 1); }
  nextPage(): void { if (this.currentPage < this.totalPages) this.goToPage(this.currentPage + 1); }

  /** Approve / Reject */
  approveRequest(r: SwapRequestI): void {
    if (!r._id) return;
    this.isLoading = true;
    this.swapService.approveRequest(r._id).subscribe({
      next: () => { this.isLoading = false; this.toastr.success('Request approved'); this.loadRequestsFromBackend(this.currentPage); },
      error: () => { this.isLoading = false; this.toastr.error('Failed to approve'); }
    });
  }
  rejectRequest(r: SwapRequestI): void {
    if (!r._id) return;
    this.isLoading = true;
    this.swapService.rejectRequest(r._id).subscribe({
      next: () => { this.isLoading = false; this.toastr.warning('Request rejected'); this.loadRequestsFromBackend(this.currentPage); },
      error: () => { this.isLoading = false; this.toastr.error('Failed to reject'); }
    });
  }

  /** Display helpers */
  getFullName(u?: { firstName?: string; lastName?: string; fullName?: string }): string {
    return u?.fullName || `${u?.firstName || ''} ${u?.lastName || ''}`.trim() || '—';
  }
  getDepartmentName(s?: { subDepartment?: { name?: string } }): string { return s?.subDepartment?.name || '—'; }
  getShiftName(s?: { shift?: { shiftName?: string } }): string { return s?.shift?.shiftName || '—'; }
  getShiftType(s?: { shift?: { shiftType?: string } }): string { return s?.shift?.shiftType || ''; }
  formatDate(dateStr?: string, withTime: boolean = false): string {
    if (!dateStr) return '—';
    const options: Intl.DateTimeFormatOptions = withTime
      ? { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateStr).toLocaleString('en-US', options);
  }
  Math = Math;
}
