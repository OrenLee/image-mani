import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHandler } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { AuthData } from './models/auth-data.model';
import { AuthError } from '../auth/models/auth-error.model';
import { LoginResponse } from './models/login-response';
import { environment } from '../../environments/environment';
import { BreakPointRegistry } from '@angular/flex-layout';

enum httpStatus {
  JWT_EXPIRED_401 = 401,
  EMAIL_ALREADY_EXISTS_409 = 409,
  NO_RESPONSE_500 = 500
}

enum statusCode {
  PASSWORD_AND_EMAIL_INCORRECT = 11,
  EMAIL_NOT_VERIFIED = 31,
  VERIFY_TOKEN_NOT_VALID = 34
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private BASE_URL = environment.baseUrl;

  private authLoginListener = new Subject<boolean>();
  private authErrorListener = new Subject<AuthError>();
  private authEmailSentConfirm = new Subject<boolean>();
  private isAccountVerified = new Subject<boolean>();

  private loggedIn = false;
  private token!: string;
  private userId!: string;
  private tokenTimer: any;
  private refreshToken!: string;

  constructor(private http: HttpClient, private router: Router) { }

  getAuthLoginListener() {
    return this.authLoginListener.asObservable();
  }

  getAuthErrorListener(){
    return this.authErrorListener.asObservable();
  }

  getAuthEmailSentConfirm() {
    return this.authEmailSentConfirm.asObservable();
  }

  getIsAccountVerified() {
    return this.isAccountVerified.asObservable();
  }

  createUser(email: string, password: string){
    this.clearAuthData();
    const authData: AuthData = { email, password};
    this.http
      .post(this.BASE_URL + "/signup/", authData).subscribe({
        next:(result: any) => {
          this.authEmailSentConfirm.next(true);
        },
        error:(err: HttpErrorResponse) => {
          let authError: AuthError = this.initAuthError();
          switch(err.error.statusCode){
            case statusCode.VERIFY_TOKEN_NOT_VALID: authError.isVerifyTokenValid = true; //User try sign up again while verify token still valid
          }

          switch(err.status){
            case httpStatus.EMAIL_ALREADY_EXISTS_409:
                authError.isUserAlreadyExist = true; break;
            case httpStatus.NO_RESPONSE_500:
                authError.isNoResponse = true; break;
            default:
                authError.isNoResponse = true;
          }
          this.authErrorListener.next(authError);
          this.authLoginListener.next(false);
        }
      });

  }

  login(email: string, password: string){
    this.clearAuthData();
    const authData: AuthData = { email, password};
    this.http
      .post(this.BASE_URL + "/login/", authData).subscribe({
        next:(result: any) => {
          const token = result.jwt;
          const refreshToken = result.refreshToken;
          if(token){
            const expirationDate = result.expiresIn;
            const now = new Date();
            //this.setAuthTimer(parseInt(expirationDate) - now.getTime());
            this.userId = result.userId;
            const refreshToken = result.refreshToken;
            this.saveAuthData(token, refreshToken, this.userId, expirationDate.toString());

            //Login and Nav
            this.authLoginListener.next(true);
            this.router.navigate(["/"]);
            this.loggedIn = true;
          }

        },
        error:(err: HttpErrorResponse) => {
          let authError: AuthError = this.initAuthError();
          let statusCodeReturned = false;
          switch(err.error.statusCode){
            case statusCode.PASSWORD_AND_EMAIL_INCORRECT:
              authError.isPasswordAndEmailIncorrect = true;
              statusCodeReturned = true;
              break;
            case statusCode.EMAIL_NOT_VERIFIED:
              statusCodeReturned = true;
              authError.isEmailVerify = true; break;
          }

          switch(err.status){
            case httpStatus.EMAIL_ALREADY_EXISTS_409:
              authError.isEmailVerify = true;
              break;
            case httpStatus.JWT_EXPIRED_401:
                break;
            default:
              authError.isNoResponse = true;
          }
          this.authErrorListener.next(authError);
          this.authLoginListener.next(false);
        }
      });
  }

  autoLoginJwt(){
    const userAuthInfo = this.getAuthData();
    if(!userAuthInfo){
      return;
    }
    const now = new Date();
    const expiresIn = parseInt(userAuthInfo.expirationDate!) - now.getTime();
    if(expiresIn > 0){
      this.token = userAuthInfo.token!;
      this.userId = userAuthInfo.userId!;
      this.authLoginListener.next(true);
    }
  }

  forgotPassword(email: string) {
    this.http.post(this.BASE_URL + "/reset-password/", {email})
      .subscribe({
        next: (result: any) => {
          console.log('reset password result: ' + result);
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        }
      });
  }

  changePassword(newPassword: string, resetToken: string){
    this.clearAuthData();
    this.http.post(this.BASE_URL + "/change-password/", { newPassword, resetToken })
      .subscribe({
        next: (result: any) => { //TODO remove duplicate code with login
          const token = result.jwt;
          const refreshToken = result.refreshToken;
          if(token){
            const expirationDate = result.expiresIn;
            const now = new Date();
            //this.setAuthTimer(parseInt(expirationDate) - now.getTime());
            this.userId = result.userId;
            const refreshToken = result.refreshToken;
            this.saveAuthData(token, refreshToken, this.userId, expirationDate.toString());

            //Login and Nav
            this.authLoginListener.next(true);
            this.router.navigate(["/"]);
            this.loggedIn = true;
          }
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        }
      })
  }

  verifyAccount(verificationToken: string){
    this.http.patch(this.BASE_URL + "/verify-account/", { verificationToken })
      .subscribe({
        next: (result: any) => {
          this.isAccountVerified.next(true);
        },
        error: (err: HttpErrorResponse) => {
          this.isAccountVerified.next(false);
        }
      });
  }

  refreashToken(){
    return this.http.post(this.BASE_URL + "/refresh-token/", {refreshToken: this.refreshToken});
  }

  logout() {
    this.authLoginListener.next(false);
    this.clearAuthData();
    //clearTimeout(this.tokenTimer);
    this.router.navigate(['/']);
  }
  public saveAccessToken(token: string){
    localStorage.setItem('token', token);
  }

  getUserId(){
    return this.userId;
  }

  private saveAuthData(token: string, refreshToken: string, userId: string, expirationDate: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('userId', userId);
    localStorage.setItem('expirationDate', expirationDate);
  }

  public getAuthData() {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const userId = localStorage.getItem('userId');
    const expirationDate = localStorage.getItem('expirationDate');
    return {token, refreshToken, userId, expirationDate};
  }

  private clearAuthData(){
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('expirationDate');
  }

  public isLoggedIn(): boolean {
    return this.loggedIn;
  }

  private initAuthError(): AuthError {
    return {
      isUserAlreadyExist: false,
      isPasswordAndEmailIncorrect: false,
      isEmailVerify: false,
      isVerifyTokenValid: false,
      isNoResponse: false
    }
  }
}
