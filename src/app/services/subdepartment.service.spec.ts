import { TestBed } from '@angular/core/testing';

import { SubdepartmentService } from './subdepartment.service';

describe('SubdepartmentService', () => {
  let service: SubdepartmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubdepartmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
