import { TestBed } from '@angular/core/testing';

import { VetsMap } from './vets-map';

describe('VetsMap', () => {
  let service: VetsMap;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VetsMap);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
