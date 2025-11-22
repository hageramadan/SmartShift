import { TestBed } from '@angular/core/testing';

import { DepartmentsServiceTs } from './departments.service.ts';

describe('DepartmentsServiceTs', () => {
  let service: DepartmentsServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DepartmentsServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
