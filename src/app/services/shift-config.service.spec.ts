import { TestBed } from '@angular/core/testing';

import { ShiftConfigService } from './shift-config.service';

describe('ShiftConfigService', () => {
  let service: ShiftConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShiftConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
