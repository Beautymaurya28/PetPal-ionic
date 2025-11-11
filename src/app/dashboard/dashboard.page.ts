import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonIcon, IonLabel, IonButton, IonImg,
  IonSpinner, AlertController, ModalController,
  IonList, IonItem, IonNote
} from '@ionic/angular/standalone';

import { Geolocation } from '@capacitor/geolocation';

import { AuthService } from '../auth/auth.service';
import { PetService, Pet } from '../services/pet.service';
import { VetsService, Vet } from '../services/vets-map.service';
import { PetFormComponent } from '../components/pet-form/pet-form.component';

import { addIcons } from 'ionicons';
import {
  pawOutline, alarmOutline, chatbubblesOutline, chevronForwardOutline,
  addCircleOutline, addOutline, shieldCheckmarkOutline, medicalOutline,
  sparklesOutline, calendarOutline, add,
  star, locationOutline,
  arrowForwardOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [
    CommonModule, RouterLink, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonMenuButton, IonCard, IonCardHeader, IonCardTitle,
    IonCardSubtitle, IonCardContent, IonIcon, IonLabel, IonButton, IonImg,
    IonSpinner, PetFormComponent, IonList, IonItem, IonNote
  ]
})
export class DashboardPage { 

  user: any = null;
  stats: any = {};
  pets: Pet[] = [];
  isLoadingPets = true;
  selectedPet: Pet | null = null;
  
  // Vets Variables
  nearbyVets: Vet[] = [];
  isLoadingVets = true; // <-- THIS IS THE FIX (was 'isLoadingVVets')
  vetsError: string | null = null;

  constructor(
    private authService: AuthService,
    private petService: PetService,
    private vetsService: VetsService,
    private router: Router,
    private alertCtrl: AlertController,
    private modalCtrl: ModalController
  ) {
    addIcons({
      pawOutline, alarmOutline, chatbubblesOutline, chevronForwardOutline,
      addCircleOutline, addOutline, shieldCheckmarkOutline, medicalOutline,
      sparklesOutline, calendarOutline, add, star, locationOutline,
      arrowForwardOutline 
    });
  }

  ionViewWillEnter() {
    this.loadData();
    this.loadNearbyVets(); 
  }

  async loadData() {
    this.isLoadingPets = true;
    this.user = await this.authService.getUser();

    this.petService.getMyPets().subscribe({
      next: (realPets: Pet[]) => {
        this.pets = realPets;
        this.stats = {
          totalPets: realPets.length,
          activeReminders: 0, 
          unreadMessages: 0, 
        };
        
        if (this.pets.length > 0) {
          if (!this.selectedPet || !this.pets.find(p => p.id === this.selectedPet?.id)) {
            this.selectedPet = this.pets[0];
          }
        } else {
          this.selectedPet = null;
        }
        
        this.isLoadingPets = false;
      },
      error: async (err: any) => {
        console.error('Failed to load pets:', err);
        this.isLoadingPets = false;
        // ... (alert code)
      }
    });
  }
  
  async loadNearbyVets() {
    this.isLoadingVets = true;
    this.vetsError = null;
    
    try {
      const coordinates = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000 
      });

      this.vetsService.getNearbyVets(coordinates.coords.latitude, coordinates.coords.longitude).subscribe({
        next: (vets: Vet[]) => {
          this.nearbyVets = vets;
          this.isLoadingVets = false;
        },
        error: (err: any) => {
          console.error('Vets API Error:', err);
          this.vetsError = 'Could not load vets.';
          this.isLoadingVets = false;
        }
      });
      
    } catch (e: any) {
      console.error('Geolocation Error:', e);
      if (e.code === 1) { // PERMISSION_DENIED
        this.vetsError = 'Please enable location to find vets.';
      } else {
        this.vetsError = 'Could not get your location.';
      }
      this.isLoadingVets = false;
    }
  }

  selectPet(pet: Pet) {
    this.selectedPet = pet;
  }

  async addPet() {
    const modal = await this.modalCtrl.create({
      component: PetFormComponent,
    });
    
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.loadData();
    }
  }
}