import { TestBed } from '@angular/core/testing';

import { SwaprequestconfigService } from './swaprequestconfig.service';

describe('SwaprequestconfigService', () => {
  let service: SwaprequestconfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SwaprequestconfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
