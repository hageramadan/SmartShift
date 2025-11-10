import { TestBed } from '@angular/core/testing';

import { SwaprequestService } from './swaprequest.service';

describe('SwaprequestService', () => {
  let service: SwaprequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwaprequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
