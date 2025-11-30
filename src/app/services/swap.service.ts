import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { CrudService } from './crud.service';
import { ApiResponse } from '../models/api-response';
import { SwapRequestI } from '../models/swap-request-i';

export interface SwapFilters {
  status?: string;
  departmentId?: string;
  fromUserId?: string;
  toUserId?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface SwapMeta {
  total: number;
  totalFiltered: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root',
})
export class SwapService implements OnDestroy {
  private requests$ = new BehaviorSubject<SwapRequestI[]>([]);
  private meta$ = new BehaviorSubject<SwapMeta>({
    total: 0,
    totalFiltered: 0,
    page: 1,
    limit: 10,
  });
  private loading$ = new BehaviorSubject<boolean>(false);
  private filters$ = new BehaviorSubject<SwapFilters>({
    page: 1,
    limit: 10,
    sort: '-createdAt',
  });

  private destroy$ = new Subject<void>();

  constructor(private crud: CrudService) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Observables */
  get requests(): Observable<SwapRequestI[]> {
    return this.requests$.asObservable();
  }

  get meta(): Observable<SwapMeta> {
    return this.meta$.asObservable();
  }

  get loading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  getCurrentFilters(): SwapFilters {
    return { ...this.filters$.value };
  }

  /** Set filters and reload data */
  setFilters(newFilters: Partial<SwapFilters>): void {
    const updatedFilters = { ...this.filters$.value, ...newFilters };
    this.filters$.next(updatedFilters);
    this.loadRequests();
  }

  /** Load swap requests from backend */
  loadRequests(): void {
    const params = this.getCurrentFilters();
    this.loading$.next(true);

    this.crud
      .getAll<SwapRequestI>('swapRequests', params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ApiResponse<SwapRequestI[]>) => {
          this.requests$.next(res.data || []);
          this.meta$.next({
            total: res.total || 0,
            totalFiltered: res.totalFiltered || 0,
            page: res.page || 1,
            limit: res.limit || 10,
          });
          this.loading$.next(false);
        },
        error: (err) => {
          console.error('Error loading swap requests:', err);
          this.requests$.next([]);
          this.loading$.next(false);
        },
      });
  }

  /** Approve request */
  approveRequest(id: string) {
    return this.crud.update<SwapRequestI>('swapRequests/isAproved', id, {
      status: 'approved',
      message: 'Request approved',
    });
  }

  /** Reject request */
  rejectRequest(id: string) {
    return this.crud.update<SwapRequestI>('swapRequests/isAproved', id, {
      status: 'rejected',
      message: 'Request rejected',
    });
  }

  getAllRequests(filters?: SwapFilters) {
    return this.crud.getAll<SwapRequestI>('swapRequests', filters);
  }
  /** Refresh current page */
  refresh(): void {
    this.loadRequests();
  }
}
