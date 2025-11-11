import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    const isLoggedIn = await this.authService.isLoggedIn();
    
    if (isLoggedIn) {
      return true; // User is logged in, allow access
    } else {
      // User is not logged in, redirect to login page
      this.router.navigateByUrl('/login', { replaceUrl: true });
      return false;
    }
  }
}