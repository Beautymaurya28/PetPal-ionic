import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton,
  IonButtons, IonBackButton, IonIcon, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent,
  LoadingController, // <-- Import LoadingController
  AlertController,   // <-- Import AlertController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { logoGoogle, callOutline } from 'ionicons/icons';

// 1. Import our new AuthService
import { AuthService } from '../auth.service'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
 imports: [
    CommonModule, ReactiveFormsModule, RouterLink, IonHeader, IonToolbar,
    IonContent, IonItem, IonInput, IonButton, IonButtons, IonBackButton, IonIcon,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  ],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    // 2. Inject the services
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController
  ) {
    addIcons({ logoGoogle, callOutline });
  }

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get email() { return this.loginForm.controls['email']; }
  get password() { return this.loginForm.controls['password']; }

  // 3. --- Updated Login Function ---
  async login() {
    if (this.loginForm.invalid) {
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Logging in...',
      spinner: 'crescent',
    });
    await loading.present();

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        loading.dismiss();
        this.router.navigateByUrl('/dashboard', { replaceUrl: true });
      },
      // --- THIS IS THE UPDATED ERROR BLOCK ---
      error: async (err) => {
        loading.dismiss();

        let header = 'Login Failed';
        let message = 'An unknown error occurred. Please try again.'; // Default

        if (err.status === 404) {
          // This is our "New User" error from the backend
          header = 'Welcome!';
          message = err.error?.detail; // This will be your message!
        } else if (err.status === 401) {
          // This is our "Wrong Password" error
          header = 'Login Failed';
          message = err.error?.detail; // "Incorrect password. Please try again."
        }
        
        // Show the correct alert
        this.showAlert(header, message);
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

  loginWithGoogle() { /* ... */ }
  loginWithPhone() { /* ... */ }
  forgotPassword() { /* ... */ }
}