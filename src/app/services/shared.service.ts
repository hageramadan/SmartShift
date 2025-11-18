import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { CrudService } from './crud.service';
import { UserI } from '../models/user-i';
import { DepartmentI } from '../models/department-i';
import { PositionI } from '../models/position-i';
import { LevelI } from '../models/level-i';
import { ApiResponse } from '../models/api-response';

type Meta = {
  total?: number;
  totalFiltered?: number;
  page?: number;
  limit?: number
};
@Injectable({
  providedIn: 'root',
})
export class SharedService {
  private users$ = new BehaviorSubject<UserI[]>([]);
  private departments$ = new BehaviorSubject<DepartmentI[]>([]);
  private positions$ = new BehaviorSubject<PositionI[]>([]);
  private levels$ = new BehaviorSubject<LevelI[]>([]);

  private meta = {
    users: new BehaviorSubject<Meta>({}),
    departments: new BehaviorSubject<Meta>({}),
    positions: new BehaviorSubject<Meta>({}),
    levels: new BehaviorSubject<Meta>({}),
  };

  private isLoaded = false; // Flag to track if data is loaded

  constructor(
    private toastr: ToastrService,
    private crud: CrudService,

  ) { }

  loadAll(): void {
    if (this.isLoaded) return;

    forkJoin({
      users: this.crud.getAll<UserI>('users'),
      depts: this.crud.getAll<DepartmentI>('departments'),
      poss: this.crud.getAll<PositionI>('positions'),
      lvls: this.crud.getAll<LevelI>('levels'),
    }).subscribe({
      next: ({ users, depts, poss, lvls }) => {
        this.users$.next(users?.data ?? []);
        this.departments$.next(depts?.data ?? []);
        this.positions$.next(poss?.data ?? []);
        this.levels$.next(lvls?.data ?? []);

        this.meta.users.next(this.extractMeta(users));
        this.meta.departments.next(this.extractMeta(depts));
        this.meta.positions.next(this.extractMeta(poss));
        this.meta.levels.next(this.extractMeta(lvls));

        this.isLoaded = true;
      },
      error: () => this.toastr.error('Failed to load shared data'),
    });
  }

  getUsers(): Observable<UserI[]> { return this.users$.asObservable(); }
  getDepartments(): Observable<DepartmentI[]> { return this.departments$.asObservable(); }
  getPositions(): Observable<PositionI[]> { return this.positions$.asObservable(); }
  getLevels(): Observable<LevelI[]> { return this.levels$.asObservable(); }

  getUsersMeta(): Observable<Meta> { return this.meta.users.asObservable(); }
  getDepartmentsMeta(): Observable<Meta> { return this.meta.departments.asObservable(); }
  getPositionsMeta(): Observable<Meta> { return this.meta.positions.asObservable(); }
  getLevelsMeta(): Observable<Meta> { return this.meta.levels.asObservable(); }

  refetchAll(): void {
    this.isLoaded = false;
    this.loadAll();
  }

  private extractMeta<T>(res?: ApiResponse<T>): Meta {
    return {
      total: res?.total,
      totalFiltered: res?.totalFiltered,
      page: res?.page,
      limit: res?.limit,
    };
  }
}
