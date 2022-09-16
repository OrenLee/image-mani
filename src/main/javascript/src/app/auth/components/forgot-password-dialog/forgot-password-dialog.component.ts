import { Component, Inject, OnInit } from '@angular/core';
import { Form, FormControl, NgForm, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from '../../auth.service';

export interface DialogData {
  animal: string;
  name: string;
}


@Component({
  selector: 'app-forgot-password-dialog',
  templateUrl: './forgot-password-dialog.component.html',
  styleUrls: ['./forgot-password-dialog.component.css']
})
export class ForgotPasswordDialogComponent implements OnInit {
  email = new FormControl('', [Validators.required, Validators.email]);

  constructor(    public dialogRef: MatDialogRef<ForgotPasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData, private authService: AuthService) { }

  ngOnInit(): void {
  }

  onResetPassword(form: NgForm){
    if (form.invalid) {
      return;
    }
    this.authService.forgotPassword(form.value.email);
  }

  getErrorMessage() {
    if (this.email.hasError('required')) {
      return 'You must enter a value';
    }

    return this.email.hasError('email') ? 'Not a valid email' : '';
  }

  close(){
    this.dialogRef.close();
  }

}
