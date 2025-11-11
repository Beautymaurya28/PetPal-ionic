import { Component, OnInit, Input } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton,
  IonItem, IonInput,
  ModalController, 
  LoadingController, 
  AlertController,
  IonLabel,      
  IonCheckbox,
  IonDatetime,
  IonDatetimeButton,
  IonModal,          
  IonFooter,
  IonTextarea
} from '@ionic/angular/standalone';
import { PetService, Pet } from 'src/app/services/pet.service';

@Component({
  selector: 'app-pet-form',
  templateUrl: './pet-form.component.html',
  styleUrls: ['./pet-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, 
    IonContent, IonButtons, IonButton, IonItem, IonInput,
    IonLabel, IonCheckbox, IonDatetime,
    IonDatetimeButton, IonModal, IonFooter, IonTextarea
  ]
})
export class PetFormComponent implements OnInit {
  @Input() petToEdit: Pet | null = null; 
  petForm!: FormGroup; // 'undefined' until ngOnInit
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private petService: PetService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
    this.isEditMode = !!this.petToEdit; 
    this.petForm = this.fb.group({
      name: ['', [Validators.required]],
      species: ['', [Validators.required]],
      breed: [''],
      photo_url: [''],
      age: [''],
      about: [''],
      last_vet_visit: [''],
      last_vax_date: [''],
      vaccinated: [false]
    });

    if (this.isEditMode && this.petToEdit) {
      this.petForm.patchValue(this.petToEdit);
    }
  }

  get name() { return this.petForm.get('name'); }
  get species() { return this.petForm.get('species'); }

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  async submitForm() {
    if (this.petForm.invalid) {
      return;
    }
    const loading = await this.loadingCtrl.create({
      message: this.isEditMode ? 'Updating pet...' : 'Saving pet...',
    });
    await loading.present();
    const formData = { ...this.petForm.value };
    if (formData.last_vet_visit === "") { formData.last_vet_visit = null; }
    if (formData.last_vax_date === "") { formData.last_vax_date = null; }
    if (this.isEditMode && this.petToEdit) {
      this.petService.updatePet(this.petToEdit.id, formData).subscribe({
        next: (updatedPet) => {
          loading.dismiss();
          this.modalCtrl.dismiss(updatedPet, 'confirm');
        },
        error: (err) => this.handleError(loading, 'Update Failed')
      });
    } else {
      this.petService.createPet(formData).subscribe({
        next: (newPet) => {
          loading.dismiss();
          this.modalCtrl.dismiss(newPet, 'confirm');
        },
        error: (err) => this.handleError(loading, 'Save Failed')
      });
    }
  }

  async handleError(loading: HTMLIonLoadingElement, header: string) {
    loading.dismiss();
    const alert = await this.alertCtrl.create({
      header,
      message: 'Could not save pet. Please try again.',
      buttons: ['OK']
    });
    await alert.present();
  }
}