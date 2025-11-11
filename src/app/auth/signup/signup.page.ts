import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { 
  FormBuilder, FormGroup, Validators, ReactiveFormsModule, 
  AbstractControl, ValidationErrors 
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton,
  IonButtons, IonBackButton, IonCheckbox, IonLabel, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent,
  LoadingController, // <-- Import LoadingController
  AlertController,   // <-- Import AlertController
} from '@ionic/angular/standalone';

// 1. Import our new AuthService
import { AuthService } from '../auth.service';

// --- Custom Validator (no changes) ---
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');
  if (!password || !confirmPassword) { return null; }
  return password.value === confirmPassword.value ? null : { passwordsDoNotMatch: true };
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [
CommonModule, ReactiveFormsModule, RouterLink, IonHeader, IonToolbar,
    IonContent, IonItem, IonInput, IonButton, IonButtons, IonBackButton,
    IonCheckbox, IonLabel, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  ],
})
export class SignupPage implements OnInit {
  signupForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    // 2. Inject the services
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {}

  ngOnInit() {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]],
    }, {
      validators: passwordsMatchValidator
    });
  }

  // --- Getters (no change) ---
  get name() { return this.signupForm.controls['name']; }
  get email() { return this.signupForm.controls['email']; }
  get phone() { return this.signupForm.controls['phone']; }
  get password() { return this.signupForm.controls['password']; }
  get confirmPassword() { return this.signupForm.controls['confirmPassword']; }
  
  // --- THIS WAS THE LINE WITH THE ERROR ---
  // I have removed the extra '{' brace
  get terms() { return this.signupForm.controls['terms']; } 

  // 3. --- Updated Signup Function ---
  async signup() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    // Show loading spinner
    const loading = await this.loadingCtrl.create({
      message: 'Creating account...',
      spinner: 'crescent',
    });
    await loading.present();

    // Prepare data for API (remove confirmPassword)
    const { confirmPassword, ...apiData } = this.signupForm.value;

    this.authService.signup(apiData).subscribe({
      next: (res) => {
        loading.dismiss();
        // Redirect to dashboard, replacing the signup page in history
        this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      },
      error: async (err) => {
        loading.dismiss();
        // Show a helpful error message
        const message = err.error?.detail || 'Signup failed. Please try again.';
        this.showAlert('Signup Error', message);
      },
    });
  }
  
  // 4. --- Helper for showing alerts ---
  async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
  
  showTerms() { 
    // TODO: Implement a modal to show terms and conditions
    console.log('TODO: Show terms modal');
  }
}