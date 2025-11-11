// src/app/interfaces/vets.interfaces.ts

// The data from your /api/vets/nearby endpoint
export interface NearbyVet {
  placeId: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  userRatingsTotal?: number;
  isOpenNow?: boolean | string;
}

// The data from your /api/vets/details endpoint
export interface VetDetails {
  placeId: string;
  name: string;
  address: string;
  phone?: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  reviews?: any[]; // Or a more specific type
  openingHours?: string[];
  website?: string;
}