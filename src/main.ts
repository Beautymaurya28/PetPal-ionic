import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { environment } from './environments/environment';

import { ReactiveFormsModule } from '@angular/forms';
import { 
  provideHttpClient, 
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS // <-- 1. Import this
} from '@angular/common/http';

// <-- 2. Import your new Interceptor
// This line should now work perfectly
import { AuthTokenInterceptor } from './app/services/auth-token.interceptor';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes),
    
    importProvidersFrom(ReactiveFormsModule),
    provideHttpClient(withInterceptorsFromDi()),
    
    // <-- 3. Add these two lines to provide the interceptor
    { 
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthTokenInterceptor, 
      multi: true 
    },
  ],
});