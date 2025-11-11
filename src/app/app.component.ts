import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // For *ngFor
import { RouterLink } from '@angular/router'; // <-- 1. This import fixes your menu navigation
import {
  IonApp, IonRouterOutlet, IonFab, IonFabButton, IonIcon,
  IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList,
  IonItem, IonLabel, IonButton, IonFooter, MenuController 
} from '@ionic/angular/standalone';

// Import our AuthService to handle logging out
import { AuthService } from './auth/auth.service';

// Import all the icons we need
import { addIcons } from 'ionicons';
import {
  chatbubblesOutline, gridOutline, pawOutline, medkitOutline,
  alarmOutline, cartOutline, mapOutline, personOutline, logOutOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,     
    RouterLink,       // <-- 2. Make sure it's in the 'imports' array
    IonApp, IonRouterOutlet, IonFab, IonFabButton, IonIcon,
    IonMenu, IonHeader, IonToolbar, IonTitle, IonContent, IonList,
    IonItem, IonLabel, IonButton, IonFooter
  ],
})
export class AppComponent {

  // 3. This is the complete list of pages for your sidebar
  appPages = [
    { page: 'Dashboard', url: '/dashboard', icon: 'grid-outline' },
    { page: 'My Pets', url: '/pets', icon: 'paw-outline' },
    { page: 'Health Records', url: '/health', icon: 'medkit-outline' },
    { page: 'Reminders', url: '/reminders', icon: 'alarm-outline' },
    { page: 'Shop', url: '/shop', icon: 'cart-outline' },
    { page: 'Nearby Vets', url: '/vets-map', icon: 'map-outline' },
    { page: 'Profile', url: '/profile', icon: 'person-outline' },
  ];

  constructor(
    private authService: AuthService,
    private menuCtrl: MenuController // Inject MenuController
  ) {
    // 4. Register all our icons
    addIcons({
      chatbubblesOutline, gridOutline, pawOutline, medkitOutline,
      alarmOutline, cartOutline, mapOutline, personOutline, logOutOutline
    });
  }

  openChat() {
    // TODO: (Phase 4) Implement chat drawer logic
    console.log('Open chat drawer');
  }

  // 5. Add functions to control the menu
  closeMenu() {
    this.menuCtrl.close();
  }

  logout() {
    this.menuCtrl.close();
    this.authService.logout(); // This will handle the token removal and redirect
  }

  // 6. This is our fix for the 'aria-hidden' warning
  onMenuOpen() {
    // Wait for the menu animation to finish (approx 300ms)
    setTimeout(() => {
      // Find the menu's list by the ID we gave it
      const menuList = document.getElementById('menu-list');
      if (menuList) {
        // Find the very first <ion-item> (link) inside the list
        const firstItem = menuList.querySelector('ion-item');
        if (firstItem) {
          // Move the browser's focus to this item
          firstItem.focus();
        }
      }
    }, 300); // 300ms is a safe delay for the animation
  }
}