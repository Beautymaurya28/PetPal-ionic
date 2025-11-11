import { TestBed } from '@angular/core/testing';

import { Pet } from './pet.service';

describe('Pet', () => {
  let service: Pet;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pet);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
