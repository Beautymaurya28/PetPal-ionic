import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonItem, IonInput, IonLabel, IonTextarea, IonDatetime, IonFooter,
  ModalController, LoadingController, AlertController,
  IonDatetimeButton, IonModal,
  IonSelect, IonSelectOption
} from '@ionic/angular/standalone';

import { ReminderService } from 'src/app/services/reminder.service';

@Component({
  selector: 'app-reminder-form',
  templateUrl: './reminder-form.component.html',
  styleUrls: ['./reminder-form.component.scss'],
  standalone: true,
  // 
  // ======================================================
  // THIS IS THE 100% COMPLETE AND CORRECT IMPORTS ARRAY
  // ======================================================
  imports: [
    CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonButtons, IonButton, IonItem, IonInput, IonLabel, 
    IonTextarea, IonDatetime, IonFooter, IonDatetimeButton, IonModal,
    IonSelect, IonSelectOption 
  ]
})
export class ReminderFormComponent implements OnInit {
  @Input() petId!: string;
  reminderForm!: FormGroup; // 'undefined' until ngOnInit

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private reminderService: ReminderService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    // NOW 'reminderForm' is created
    this.reminderForm = this.fb.group({
      title: ['', [Validators.required]],
      due_date: ['', [Validators.required]],
      due_time: [''],
      recurrence: ['none', [Validators.required]],
      notes: [''],
    });
  }

  // Getters for the template
  get title() { return this.reminderForm.get('title'); }
  get due_date() { return this.reminderForm.get('due_date'); }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async submitForm() {
    if (this.reminderForm.invalid) {
      return;
    }

    const loading = await this.loadingCtrl.create({ message: 'Saving Reminder...' });
    await loading.present();
    
    const formData = { ...this.reminderForm.value };

    if (formData.due_date === "") { formData.due_date = null; }
    if (formData.due_time === "") { formData.due_time = null; }

    formData.pet_id = this.petId;

    this.reminderService.createReminder(formData).subscribe({
      next: (newReminder) => {
        loading.dismiss();
        this.modalCtrl.dismiss(newReminder, 'confirm');
      },
      error: (err) => this.handleError(loading, 'Save Failed')
    });
  }

  async handleError(loading: HTMLIonLoadingElement, header: string) {
    loading.dismiss();
    const alert = await this.alertCtrl.create({
      header,
      message: 'Could not save reminder. Please try again.',
      buttons: ['OK']
    });
    await alert.present();
  }
}