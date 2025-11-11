import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences'; // <-- Import secure storage
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

// This is the key we'll use in secure storage
const AUTH_TOKEN_KEY = 'petpal_auth_token';

// Interface for our API's token response (matches your backend)
export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  // --- 1. SIGNUP METHOD ---
  signup(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/signup`, credentials)
      .pipe(
  tap(async (res) => {
    // On success, store the token AND the user
    await this.storeToken(res.access_token, res.user); // <-- Pass res.user
  })
);
  }

  // --- 2. LOGIN METHOD ---
  login(credentials: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/api/auth/login`, credentials)
      .pipe(
  tap(async (res) => {
    // On success, store the token AND the user
    await this.storeToken(res.access_token, res.user); // <-- Pass res.user
  })
);
  }


  // Add this new function at the end of auth.service.ts, before the last '}'
async getUser(): Promise<any | null> {
  const ret = await Preferences.get({ key: 'petpal_user' });
  if (ret.value) {
    return JSON.parse(ret.value);
  }
  return null;
}

  // --- 3. LOGOUT METHOD ---
  async logout() {
    await Preferences.remove({ key: AUTH_TOKEN_KEY });
    this.router.navigateByUrl('/welcome', { replaceUrl: true });
  }

  // --- 4. TOKEN STORAGE HELPERS ---
  private async storeToken(token: string, user: any) { // <-- 1. Add 'user' parameter
  await Preferences.set({
    key: AUTH_TOKEN_KEY,
    value: token,
  });
  // 2. Save the user object as a string
  await Preferences.set({
    key: 'petpal_user',
    value: JSON.stringify(user),
  });
}

  async getToken(): Promise<string | null> {
    const ret = await Preferences.get({ key: AUTH_TOKEN_KEY });
    return ret.value;
  }

  // --- 5. AUTH GUARD HELPER ---
  async isLoggedIn(): Promise<boolean> {
    const token = await this.getToken();
    return !!token; // Returns true if token exists, false otherwise
  }
}