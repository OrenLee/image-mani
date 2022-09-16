import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './auth/components/signup/signup.component';
import { LoginComponent } from './auth/components/login/login.component';
import { ImageComponent } from './image-manipulation/components/image/image.component';
import { ImageListComponent } from './image-manipulation/components/image-list/image-list.component';
import { ResetPasswordComponent } from './auth/components/reset-password/reset-password.component';
import { VerifyAccountComponent } from './auth/components/verify-account/verify-account.component';

const routes: Routes = [
  { path: "", component: ImageComponent },
  { path: "login", component: LoginComponent },
  { path: "signup", component: SignupComponent },
  { path: "images", component: ImageListComponent },
  { path: "verify-account", component: VerifyAccountComponent},
  { path: "change-password", component: ResetPasswordComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
