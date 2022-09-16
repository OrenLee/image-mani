import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { HammerModule } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import {  MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavbarComponent } from './navbar/navbar.component';
import { SignupComponent } from './auth/components/signup/signup.component';
import { DialogConfirmUpdate, ImageComponent } from './image-manipulation/components/image/image.component';
import { LoginComponent } from './auth/components/login/login.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageDragDirective } from './image-manipulation/image-drag.directive';
import { ImageListComponent } from './image-manipulation/components/image-list/image-list.component';
import { AuthInterceptor } from './auth/auth.interceptor';
import { ForgotPasswordDialogComponent } from './auth/components/forgot-password-dialog/forgot-password-dialog.component';
import { ResetPasswordComponent } from './auth/components/reset-password/reset-password.component';
import { VerifyAccountComponent } from './auth/components/verify-account/verify-account.component';
import { AngularMaterialModule } from './angular-material.module';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    SignupComponent,
    ImageComponent,
    LoginComponent,
    ImageDragDirective,
    ImageListComponent,
    ForgotPasswordDialogComponent,
    ResetPasswordComponent,
    VerifyAccountComponent,
    DialogConfirmUpdate
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    ImageCropperModule,
    HammerModule,
    FlexLayoutModule,
    AngularMaterialModule
  ],
  entryComponents: [ForgotPasswordDialogComponent],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
