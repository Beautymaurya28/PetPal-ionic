import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Geolocation, Position } from '@capacitor/geolocation';
import { GoogleMap, Marker, CreateMapArgs } from '@capacitor/google-maps';
import { VetsMapService } from 'src/app/services/vets-map.service';
import { NearbyVet, VetDetails } from 'src/app/interfaces/vets.interfaces';
import { Browser } from '@capacitor/browser';
import { ModalController } from '@ionic/angular';
import { IonHeader, IonToolbar } from "@ionic/angular/standalone";

// We'll use the vet-detail modal later, for now we log
// import { VetDetailModalComponent } from 'src/app/modals/vet-detail/vet-detail.component';


@Component({
  selector: 'app-vets-map',
  templateUrl: './vets-map.page.html',
  styleUrls: ['./vets-map.page.scss'],
})
export class VetsMapPage implements OnDestroy {
  @ViewChild('map') mapRef!: ElementRef<HTMLElement>;
  map: GoogleMap | null = null;

  userPosition: Position | null = null;
  nearbyVets: NearbyVet[] = [];
  isLoading = true;
  
  // This controls the sliding list view
  listSheetBreakpoint = 0.25;

  constructor(
    private vetsService: VetsMapService,
    private modalCtrl: ModalController
  ) {}

  ionViewDidEnter() {
    this.locateAndLoadVets();
  }

  async locateAndLoadVets() {
    try {
      this.isLoading = true;
      // 1. Get user's current location
      this.userPosition = await Geolocation.getCurrentPosition();
      const coords = this.userPosition.coords;

      // 2. Create the map
      await this.createMap(coords.latitude, coords.longitude);

      // 3. Load vets from your backend
      this.vetsService.getNearbyVets(coords.latitude, coords.longitude).subscribe(
        (vets) => {
          this.nearbyVets = vets;
          this.addVetMarkers(vets);
          this.isLoading = false;
          
          // Open the list view slightly
          this.listSheetBreakpoint = 0.4; 
        },
        (error) => {
          console.error('Error loading vets:', error);
          this.isLoading = false;
        }
      );
    } catch (e) {
      console.error('Error getting location or map', e);
      // TODO: Handle no-location permission
      this.isLoading = false;
    }
  }

  async createMap(lat: number, lng: number) {
    if (!this.mapRef) return;

    const mapArgs: CreateMapArgs = {
      element: this.mapRef.nativeElement,
      apiKey: 'YOUR_FRONTEND_API_KEY', // <-- Your *CLIENT-SIDE* key
      config: {
        center: { lat, lng },
        zoom: 13,
      },
    };
    this.map = await GoogleMap.create(mapArgs);
    
    // Add user marker
    await this.map.addMarkers([
      {
        coordinate: { lat, lng },
        title: 'Your Location',
        iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      },
    ]);

    // Add marker click listener
    await this.map.setOnMarkerClickListener(async (event) => {
      console.log('Marker clicked:', event.markerId);
      const vet = this.nearbyVets.find(v => v.placeId === event.markerId);
      if (vet) {
        this.showVetDetails(vet);
      }
    });
  }

  async addVetMarkers(vets: NearbyVet[]) {
    if (!this.map) return;

    const markers: Marker[] = vets.map((vet) => ({
      markerId: vet.placeId, // Use placeId as the markerId for tracking
      coordinate: {
        lat: vet.location.lat,
        lng: vet.location.lng,
      },
      title: vet.name,
      snippet: vet.address,
    }));

    await this.map.addMarkers(markers);
  }

  async showVetDetails(vet: NearbyVet) {
    // Phase 5 says "Clicking a vet shows details"
    // We will log details for now, but this should open a modal
    
    // In a real app, you would open a modal here:
    // const modal = await this.modalCtrl.create({
    //   component: VetDetailModalComponent,
    //   componentProps: { placeId: vet.placeId }
    // });
    // await modal.present();
    
    console.log('Showing details for:', vet.name);
    // You could also just fetch and log for testing:
    this.vetsService.getVetDetails(vet.placeId).subscribe(details => {
      console.log('Full Vet Details:', details);
      alert(`Details for ${details.name}: ${details.phone || 'No phone'}`);
    });
  }

  // --- List View Actions ---

  async openDirections(vet: NearbyVet) {
    if (!this.userPosition) return;
    
    const userLat = this.userPosition.coords.latitude;
    const userLng = this.userPosition.coords.longitude;
    const destination = encodeURIComponent(vet.address);
    
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destination}`;

    await Browser.open({ url });
  }

  callVet(vet: VetDetails | NearbyVet) {
    // Note: getVetDetails() is needed to get the phone number
    // This is a simplified example.
    
    // For this to work, you MUST call getVetDetails first.
    // We'll just log for now.
    
    if ('phone' in vet && vet.phone) {
      window.open(`tel:${vet.phone}`, '_system');
    } else {
      alert('Phone number not available. Fetching details first.');
      this.vetsService.getVetDetails(vet.placeId).subscribe(details => {
         if (details.phone) {
           window.open(`tel:${details.phone}`, '_system');
         } else {
           alert('No phone number listed for this vet.');
         }
      });
    }
  }
  
  bookVet(vet: NearbyVet) {
    // This would navigate to your booking page/flow
    console.log('Booking vet:', vet.placeId);
    // this.router.navigate(['/tabs/book-appointment', vet.placeId]);
  }

  ngOnDestroy() {
    this.map?.destroy();
  }
}