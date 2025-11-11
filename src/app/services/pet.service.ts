import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// --- THIS IS THE FIX ---
// We are adding the new fields to the interface
// so TypeScript knows they exist.
export interface Pet {
  id: string;
  owner_id: string;
  name: string;
  species: string;
  breed?: string;
  dob?: string;
  age?: string;
  weight?: number;
  photo_url?: string;
  last_vet_visit?: string; // (comes as string from JSON)
  last_vax_date?: string;  // (comes as string from JSON)
  vaccinated: boolean;
  about?: string; // <-- ADD THIS
}
// --- END OF FIX ---

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Gets all pets for the currently logged-in user.
   */
  getMyPets(): Observable<Pet[]> {
    return this.http.get<Pet[]>(`${this.apiUrl}/api/pets/`);
  }

  getPetById(id: string): Observable<Pet> {
    return this.http.get<Pet>(`${this.apiUrl}/api/pets/${id}`);
  }
  /**
   * Creates a new pet for the user.
   */
  createPet(petData: any): Observable<Pet> {
    return this.http.post<Pet>(`${this.apiUrl}/api/pets/`, petData);
  }

  // ... (getPetById() is right above this) ...

  /**
   * Updates an existing pet's details.
   */
  updatePet(id: string, petData: Partial<Pet>): Observable<Pet> {
    return this.http.put<Pet>(`${this.apiUrl}/api/pets/${id}`, petData);
  }

  /**
   * Deletes a pet.
   */
  deletePet(id: string): Observable<{success: boolean, message: string}> {
    return this.http.delete<{success: boolean, message: string}>(`${this.apiUrl}/api/pets/${id}`);
  }
}



