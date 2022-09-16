import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-verify-account',
  templateUrl: './verify-account.component.html',
  styleUrls: ['./verify-account.component.scss']
})
export class VerifyAccountComponent implements OnInit {
  isAccountVerified = false;
  verificationToken!: string;
  errorVerify = false;

  constructor(private authService: AuthService,
     private router: Router,
     private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.authService
      .getIsAccountVerified()
      .subscribe((isAccountVerified: boolean):void => {
        this.isAccountVerified = isAccountVerified;
        this.errorVerify = !isAccountVerified;
      });

    this.authService
      .getIsAccountVerified()
      .subscribe()

    this.route.queryParams
    .subscribe(params => {
      if(params['token']){
        this.verificationToken = params['token'];
      }
    });

    this.authService.verifyAccount(this.verificationToken);
  }

}
