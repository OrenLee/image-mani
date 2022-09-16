import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl, Validators, NgForm, FormBuilder } from '@angular/forms';

import { AuthService } from '../../auth.service';
import { AuthError } from '../../models/auth-error.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  public innerWidth: any;
  public innerHeight: any;

  form = this.fb.group({
    email: [
      null,
      [
        Validators.required, Validators.email
      ]
    ],
    password: [
      null,
      [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/),
        Validators.minLength(8)
      ]
    ]
  });

  userAlreadyExists: boolean = false;
  isEmailSent: boolean = false;
  isSignupRequestSent: boolean = false;
  isNoResponse: boolean = false;
  isVerifyTokenValid: boolean = false;

  constructor(private authService: AuthService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.innerWidth = window.innerWidth;
    this.innerHeight = window.innerHeight;

    this.authService
    .getAuthErrorListener()
    .subscribe((authError: AuthError) => {
      this.userAlreadyExists = authError.isUserAlreadyExist;
      this.isNoResponse = authError.isNoResponse;
      this.isVerifyTokenValid = authError.isVerifyTokenValid;
    });

    this.authService
      .getAuthEmailSentConfirm()
      .subscribe((isEmailSent: boolean):void => {
        this.isEmailSent = isEmailSent
      });
  }

  /*getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }*/

  onSignup() {
    if (this.form.valid) {
      this.authService.createUser(this.form.value.email, this.form.value.password);
      this.isSignupRequestSent = true;
    }
  }

  @HostListener('window:resize', ['$event'])
    onResize(event: Event) {
      this.innerWidth = window.innerWidth;
      this.innerHeight = window.innerHeight;
  }
}
