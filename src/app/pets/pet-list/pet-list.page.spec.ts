import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PetListPage } from './pet-list.page';

describe('PetListPage', () => {
  let component: PetListPage;
  let fixture: ComponentFixture<PetListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PetListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
