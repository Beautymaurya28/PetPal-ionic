import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs'; // To run multiple API calls at once
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
  IonMenuButton, IonSpinner, IonSegment, IonSegmentButton, IonLabel,
  IonList, IonItem, IonIcon, IonText,
  IonButton, ModalController, AlertController,
  IonItemSliding, IonItemOptions, IonItemOption // <-- For swipe buttons
} from '@ionic/angular/standalone';

// Import our services and components
import { PetService, Pet } from 'src/app/services/pet.service';
import { ReminderService, Reminder } from 'src/app/services/reminder.service';
import { ReminderFormComponent } from 'src/app/components/reminder-form/reminder-form.component';

// Import icons
import { addIcons } from 'ionicons';
import { alarmOutline, addCircleOutline, createOutline, trashOutline } from 'ionicons/icons';

@Component({
  selector: 'app-reminder-list',
  templateUrl: './reminder-list.page.html',
  styleUrls: ['./reminder-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons,
    IonMenuButton, IonSpinner, IonSegment, IonSegmentButton, IonLabel,
    IonList, IonItem, IonIcon, IonText,
    IonButton, ReminderFormComponent,
    IonItemSliding, IonItemOptions, IonItemOption
  ]
})
export class ReminderListPage implements OnInit {

  pets: Pet[] = [];
  allReminders: Reminder[] = [];
  filteredReminders: Reminder[] = []; // The list we actually show
  
  isLoading = true;
  selectedFilter: string = 'all'; // 'all' or a pet's ID

  constructor(
    private petService: PetService,
    private reminderService: ReminderService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController
  ) {
    addIcons({ alarmOutline, addCircleOutline, createOutline, trashOutline });
  }

  ngOnInit() {
    // We use ionViewWillEnter to refresh data every time
  }

  ionViewWillEnter() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    forkJoin({
      pets: this.petService.getMyPets(),
      reminders: this.reminderService.getAllMyReminders()
    }).subscribe({
      next: (results) => {
        this.pets = results.pets;
        this.allReminders = results.reminders;
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
      this.filteredReminders = this.allReminders;
    } else {
      this.filteredReminders = this.allReminders.filter(r => r.pet_id === this.selectedFilter);
    }
  }

  getPetName(petId: string): string {
    const pet = this.pets.find(p => p.id === petId);
    return pet ? pet.name : 'Unknown Pet';
  }

  async openAddReminderModal() {
    let petIdToPreselect = this.selectedFilter;
    if (petIdToPreselect === 'all') {
      if (this.pets.length === 0) { return; }
      petIdToPreselect = this.pets[0].id; // Default to first pet
    }
    
    const modal = await this.modalCtrl.create({
      component: ReminderFormComponent,
      componentProps: { petId: petIdToPreselect }
    });
    
    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirm') {
      this.loadData(); // Refresh all data
    }
  }

  async onDelete(reminderId: string) {
    const alert = await this.alertCtrl.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this reminder?',
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            // Remove from list immediately for fast UI
            this.allReminders = this.allReminders.filter(r => r.id !== reminderId);
            this.applyFilter();
            // Call API to delete
            this.reminderService.deleteReminder(reminderId).subscribe();
          }
        }
      ]
    });
    await alert.present();
  }
}