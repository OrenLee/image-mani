import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  loggedIn = false;
  authStatusListener = new Subscription();

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authStatusListener = this.authService
    .getAuthLoginListener()
    .subscribe(res => {
      this.loggedIn = res;
    })
    this.authService.autoLoginJwt();
  }

  onLogout(){
    this.authService.logout();
  }

  ngOnDestroy() {
    this.authStatusListener.unsubscribe();
  }
}
