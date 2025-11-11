import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface HealthRecord {
  id: string;
  pet_id: string;
  owner_id: string;
  title: string;
  date: string; // Comes as a string from JSON
  notes?: string;
  tags?: string[];
  attachment_url?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class HealthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Gets ALL health records for the logged-in user (for the /health page).
   */
  getAllMyRecords(): Observable<HealthRecord[]> {
    return this.http.get<HealthRecord[]>(`${this.apiUrl}/api/records/all`);
  }

  /**
   * Gets all health records for a specific pet.
   */
  getRecordsForPet(petId: string): Observable<HealthRecord[]> {
    return this.http.get<HealthRecord[]>(`${this.apiUrl}/api/records/pet/${petId}`);
  }

  /**
   * Creates a new health record.
   */
  createRecord(recordData: any): Observable<HealthRecord> {
    return this.http.post<HealthRecord>(`${this.apiUrl}/api/records/`, recordData);
  }
}