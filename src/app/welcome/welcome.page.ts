import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // <-- Import RouterLink
import { 
  IonContent, 
  IonButton 
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonButton, 
    RouterLink  // <-- Add RouterLink to imports
  ]
})
export class WelcomePage {
  constructor() { }
}