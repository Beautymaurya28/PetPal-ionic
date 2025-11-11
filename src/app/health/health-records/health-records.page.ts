import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs'; 
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonSpinner, IonSegment, IonSegmentButton, IonLabel,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonText,
  IonList, IonItem, IonIcon,
  IonCardContent,
  IonButton, 
  ModalController
} from '@ionic/angular/standalone';

import { PetService, Pet } from 'src/app/services/pet.service';
import { HealthService, HealthRecord } from 'src/app/services/health.service';
import { HealthRecordFormComponent } from 'src/app/components/health-record-form/health-record-form.component';

import { addIcons } from 'ionicons';
import { medicalOutline, addCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-health-records',
  templateUrl: './health-records.page.html',
  styleUrls: ['./health-records.page.scss'],
  standalone: true,
  // This is the complete, correct imports array
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonSpinner, IonSegment, IonSegmentButton, IonLabel,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonText,
    IonList, IonItem, IonIcon,
    IonCardContent,
    IonButton,
    HealthRecordFormComponent
  ]
})
export class HealthRecordsPage implements OnInit {

  pets: Pet[] = [];
  allRecords: HealthRecord[] = [];
  filteredRecords: HealthRecord[] = []; 
  isLoading = true;
  selectedFilter: string = 'all'; 

  constructor(
    private petService: PetService,
    private healthService: HealthService,
    private modalCtrl: ModalController
  ) {
    addIcons({ medicalOutline, addCircleOutline });
  }

  ngOnInit() { }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    forkJoin({
      pets: this.petService.getMyPets(),
      records: this.healthService.getAllMyRecords()
    }).subscribe({
      next: (results) => {
        this.pets = results.pets;
        this.allRecords = results.records;
        this.applyFilter();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load data', err);
        this.isLoading = false;
      }
    });
  }

  filterChanged(event: any) {
    this.selectedFilter = event.detail.value;
    this.applyFilter();
  }

  applyFilter() {
    if (this.selectedFilter === 'all') {
      this.filteredRecords = this.allRecords;
    } else {
      this.filteredRecords = this.allRecords.filter(record => 
        record.pet_id === this.selectedFilter
      );
    }
  }

  getPetName(petId: string): string {
    const pet = this.pets.find(p => p.id === petId);
    return pet ? pet.name : 'Unknown Pet';
  }

  async openAddRecordModal() {
    let petIdToPreselect = this.selectedFilter;
    if (petIdToPreselect === 'all') {
      if (this.pets.length === 0) {
        console.error("No pets exist to add a record to.");
        return;
      }
      petIdToPreselect = this.pets[0].id;
    }
    
    const modal = await this.modalCtrl.create({
      component: HealthRecordFormComponent,
      componentProps: {
        petId: petIdToPreselect
      }
    });
    
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.loadData();
    }
  }
}