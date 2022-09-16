import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, filter, switchMap, take, catchError, throwError } from 'rxjs';

import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const localData = this.authService.getAuthData();
    let authRequest = this.addTokenHeader(request, localData.token!, localData.userId!);

    return next.handle(authRequest).pipe(
      catchError(error => {
        if(error instanceof HttpErrorResponse && error.status == 401){
          return this.handle401Error(authRequest, next, localData.refreshToken!);
        }
        return throwError(error);
      })
    );
  }

  private addTokenHeader(request: HttpRequest<any>, token: string, userId: string){
    let headers = null;
    let authRequest = request.clone();
    if(token != null && userId != null){
      headers = new HttpHeaders({
        'Authorization': 'Bearer ' + token,
        'userId': '' + userId
      });
      authRequest = request.clone({headers});
    }
    return authRequest;
  }

  private handle401Error(request: HttpRequest<unknown>, next:HttpHandler, refrreshToken: string){
    return this.authService.refreashToken().pipe(
      switchMap((val:any) => {
        this.authService.saveAccessToken(val.jwt); //Save a new valid token
        const localData = this.authService.getAuthData();
        let validTokenRequest = this.addTokenHeader(request, localData.token!, localData.userId!);
        return next.handle(validTokenRequest);

      }),
      catchError((err) => {
        this.authService.logout();
        return throwError(err);
      })
    )
  }
}
