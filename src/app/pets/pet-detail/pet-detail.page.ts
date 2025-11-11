import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonBackButton, IonSpinner, IonImg, IonSegment, IonSegmentButton,
  IonLabel, IonList, IonItem, IonIcon,
  ModalController, AlertController, IonButton,
  IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonText
} from '@ionic/angular/standalone';

// Import our Services and Components
import { PetService, Pet } from 'src/app/services/pet.service';
import { HealthService, HealthRecord } from 'src/app/services/health.service';
import { ReminderService, Reminder } from 'src/app/services/reminder.service'; // <-- 1. Import ReminderService
import { PetFormComponent } from 'src/app/components/pet-form/pet-form.component';
import { HealthRecordFormComponent } from 'src/app/components/health-record-form/health-record-form.component';
import { ReminderFormComponent } from 'src/app/components/reminder-form/reminder-form.component'; // <-- 2. Import ReminderFormComponent

// Import Icons
import { addIcons } from 'ionicons';
import { 
  calendarOutline, shieldCheckmarkOutline, createOutline, trashOutline, 
  alertCircleOutline, add, medicalOutline,
  alarmOutline // <-- 3. Import 'alarmOutline'
} from 'ionicons/icons';

@Component({
  selector: 'app-pet-detail',
  templateUrl: './pet-detail.page.html',
  styleUrls: ['./pet-detail.page.scss'],
  standalone: true,
  // 4. Update the imports array
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonBackButton, IonSpinner, IonImg, IonSegment,
    IonSegmentButton, IonLabel, IonList, IonItem, IonIcon,
    IonButton, PetFormComponent, HealthRecordFormComponent,
    ReminderFormComponent, // <-- 5. Add ReminderFormComponent
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCardSubtitle, IonText
  ]
})
export class PetDetailPage implements OnInit {
  pet: Pet | null = null;
  isLoading = true;
  error: string | null = null;
  selectedTab: string = 'overview';
  
  healthRecords: HealthRecord[] = [];
  isLoadingRecords = false;
  
  // --- 6. New variables for Reminders ---
  reminders: Reminder[] = [];
  isLoadingReminders = false;

  constructor(
    private route: ActivatedRoute,
    private petService: PetService,
    private healthService: HealthService, 
    private reminderService: ReminderService, // <-- 7. Inject ReminderService
    private router: Router, 
    private modalCtrl: ModalController, 
    private alertCtrl: AlertController  
  ) {
    addIcons({ 
      calendarOutline, shieldCheckmarkOutline, createOutline, trashOutline, 
      alertCircleOutline, add, medicalOutline,
      alarmOutline // <-- 8. Register 'alarmOutline'
    });
  }

  ngOnInit() {
    this.loadPetData();
  }

  loadPetData() {
    this.isLoading = true;
    this.error = null;
    const petId = this.route.snapshot.paramMap.get('id');

    if (!petId) {
      this.isLoading = false;
      this.error = "No Pet ID provided.";
      return;
    }

    // This now fetches the pet, then their records, then their reminders
    this.petService.getPetById(petId).subscribe({
      next: (data) => {
        this.pet = data;
        this.isLoading = false;
        // Once pet is loaded, load both records and reminders
        this.loadHealthRecords(petId);
        this.loadReminders(petId); // <-- 9. Load reminders
      },
      error: (err) => {
        // ... (error handling)
      }
    });
  }
  
  loadHealthRecords(petId: string) {
    this.isLoadingRecords = true;
    this.healthService.getRecordsForPet(petId).subscribe({
      next: (records: HealthRecord[]) => {
        this.healthRecords = records;
        this.isLoadingRecords = false;
      },
      error: (err: any) => {
        // ... (error handling)
      }
    });
  }
  
  // --- 10. New function to load reminders ---
  loadReminders(petId: string) {
    this.isLoadingReminders = true;
    this.reminderService.getRemindersForPet(petId).subscribe({
      next: (data) => {
        this.reminders = data;
        this.isLoadingReminders = false;
      },
      error: (err) => {
        console.error('Failed to load reminders:', err);
        this.isLoadingReminders = false;
      }
    });
  }

  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
  }
  
  // --- 11. New function to open the "Add Reminder" modal ---
  async openAddReminderModal() {
    if (!this.pet) return;

    const modal = await this.modalCtrl.create({
      component: ReminderFormComponent,
      componentProps: {
        petId: this.pet.id
      }
    });
    
    await modal.present();
    
    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'confirm' && data) {
      // Add the new reminder to the list
      this.reminders.push(data);
    }
  }

  // --- (onEdit, onDelete, openAddRecordModal are unchanged) ---
  async openAddRecordModal() { /* ... */ }
  async onEdit() { /* ... */ }
  async onDelete() { /* ... */ }
  deletePet() { /* ... */ }
}