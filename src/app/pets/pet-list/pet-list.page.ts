import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonSpinner, IonIcon,
  ModalController,
  IonButton,
  IonGrid, IonRow, IonCol, 
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, 
  IonImg,
  IonLabel // <-- THIS WAS THE MISSING IMPORT
} from '@ionic/angular/standalone';

import { PetService, Pet } from 'src/app/services/pet.service';
import { PetFormComponent } from 'src/app/components/pet-form/pet-form.component';

import { addIcons } from 'ionicons';
import { addCircleOutline, chevronForwardOutline, pawOutline } from 'ionicons/icons'; 

@Component({
  selector: 'app-pet-list',
  templateUrl: './pet-list.page.html',
  styleUrls: ['./pet-list.page.scss'],
  standalone: true,
  // 
  // ======================================================
  // THIS IS THE 100% CORRECT IMPORTS ARRAY
  // ======================================================
  imports: [
    CommonModule, 
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonMenuButton, IonSpinner, IonIcon,
    PetFormComponent,
    IonButton,
    IonGrid, IonRow, IonCol,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonImg,
    IonLabel // <-- IT IS NOW INCLUDED
  ]
})
export class PetListPage implements OnInit {
  pets: Pet[] = [];
  isLoading = true;

  constructor(
    private petService: PetService,
    private modalCtrl: ModalController,
    private router: Router
  ) {
    addIcons({ addCircleOutline, chevronForwardOutline, pawOutline });
  }

  ngOnInit() { }

  ionViewWillEnter() {
    this.loadPets();
  }

  loadPets() {
    this.isLoading = true;
    this.petService.getMyPets().subscribe({
      next: (data) => {
        this.pets = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  async openAddPetModal() {
    const modal = await this.modalCtrl.create({
      component: PetFormComponent,
    });
    
    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.loadPets();
    }
  }

  viewPet(petId: string) {
    this.router.navigate(['/pets', petId]);
  }
}