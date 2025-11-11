import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AuthTokenInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    // We only want to intercept requests to our OWN API
    if (request.url.includes('/api/')) {

      // from() converts the Promise (from getToken) into an Observable
      return from(this.authService.getToken()).pipe(
        switchMap(token => {
          if (token) {
            // If we have a token, clone the request and add the auth header
            request = request.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
          }
          return next.handle(request);
        })
      );
    }

    // For all other requests, just let them pass
    return next.handle(request);
  }
}