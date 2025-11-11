import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VetsMapPage } from './vets-map.page';

describe('VetsMapPage', () => {
  let component: VetsMapPage;
  let fixture: ComponentFixture<VetsMapPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VetsMapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
