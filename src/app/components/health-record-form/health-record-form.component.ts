import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonItem, IonInput, IonLabel, IonTextarea, IonDatetime, IonFooter,
  ModalController, LoadingController, AlertController,
  IonDatetimeButton, IonModal
} from '@ionic/angular/standalone';
import { HealthService } from 'src/app/services/health.service';

@Component({
  selector: 'app-health-record-form',
  templateUrl: './health-record-form.component.html',
  styleUrls: ['./health-record-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle,
    IonContent, IonButtons, IonButton, IonItem, IonInput, IonLabel,
    IonTextarea, IonDatetime, IonFooter, IonDatetimeButton, IonModal
  ]
})
export class HealthRecordFormComponent implements OnInit {
  @Input() petId!: string;
  recordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private healthService: HealthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.recordForm = this.fb.group({
      title: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required),
      notes: new FormControl(''),
      tags: new FormControl('')
    });
  }

  // Strongly typed getters to prevent null issues
  get title(): FormControl {
    return this.recordForm.get('title') as FormControl;
  }

  get date(): FormControl {
    return this.recordForm.get('date') as FormControl;
  }

  onDateChange(event: any) {
    const selectedDate = event.detail.value;
    if (selectedDate) {
      this.recordForm.patchValue({ date: selectedDate });
    }
  }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async submitForm() {
    if (this.recordForm.invalid) return;

    const loading = await this.loadingCtrl.create({ message: 'Saving Record...' });
    await loading.present();

    const formData = { ...this.recordForm.value };
    formData.tags = formData.tags
      ? formData.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t)
      : [];
    formData.pet_id = this.petId;

    this.healthService.createRecord(formData).subscribe({
      next: (newRecord) => {
        loading.dismiss();
        this.modalCtrl.dismiss(newRecord, 'confirm');
      },
      error: () => this.handleError(loading, 'Save Failed')
    });
  }

  private async handleError(loading: HTMLIonLoadingElement, header: string) {
    await loading.dismiss();
    const alert = await this.alertCtrl.create({
      header,
      message: 'Could not save record. Please try again.',
      buttons: ['OK']
    });
    await alert.present();
  }
}
