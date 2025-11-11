import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HealthRecordsPage } from './health-records.page';

describe('HealthRecordsPage', () => {
  let component: HealthRecordsPage;
  let fixture: ComponentFixture<HealthRecordsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HealthRecordsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
