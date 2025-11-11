// src/app/services/vets-map.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { NearbyVet, VetDetails } from '../interfaces/vets.interfaces';

@Injectable({
  providedIn: 'root'
})
export class VetsMapService {
  // Use your backend's URL. This is for local dev.
  private API_URL = 'http://localhost:8000/api/vets';

  constructor(private http: HttpClient) { }

  getNearbyVets(lat: number, lng: number, radius = 5000): Observable<NearbyVet[]> {
    const params = {
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString()
    };
    return this.http.get<NearbyVet[]>(`${this.API_URL}/nearby`, { params });
  }

  getVetDetails(placeId: string): Observable<VetDetails> {
    return this.http.get<VetDetails>(`${this.API_URL}/details`, {
      params: { place_id: placeId }
    });
  }
}