import { Component, ElementRef, Inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, Validators, NgForm } from '@angular/forms';

import { AuthService } from '../../auth.service';
import { AuthError } from '../../models/auth-error.model';

import { MatDialog, MatDialogConfig, MatDialogRef, MAT_DIALOG_DATA  } from '@angular/material/dialog';
import { ForgotPasswordDialogComponent } from '../forgot-password-dialog/forgot-password-dialog.component';

import {OverlayContainer, ComponentType} from '@angular/cdk/overlay';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  //form
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required]);

  @ViewChild('dialogRef')
  dialogRef!: TemplateRef<any>;

  //Errors
  isEmailVerify = false;
  isNoResponse = false;
  isPasswordAndEmailIncorrect = false;

  constructor(private authService: AuthService, public dialog: MatDialog, overlayContainer :OverlayContainer) {
    overlayContainer.getContainerElement().classList.add('unicorn-dark-theme');
   }

  ngOnInit(): void {
    this.authService
      .getAuthErrorListener()
      .subscribe((authError: AuthError) => {
        this.isEmailVerify = authError.isEmailVerify;
        this.isNoResponse = authError.isNoResponse;
        this.isPasswordAndEmailIncorrect = authError.isPasswordAndEmailIncorrect;
      });
  }

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  onLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.authService.login(form.value.email, form.value.password);
  }

  openForgotPasswordDialog(event: Event){
    const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, {
        restoreFocus: false,
        hasBackdrop: true,
        backdropClass: 'backdropBackground',
        width: '60vw'
      });
  }
}
