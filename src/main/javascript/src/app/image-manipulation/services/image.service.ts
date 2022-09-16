import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { Image } from '../models/image.model';
import { Effects } from '../models/effects.model';
import { environment } from '../../../environments/environment';
import { ImageError } from '../models/image-error.model';

const BASE_URL = environment.baseUrl;
enum httpStatus{
  JWT_EXPIRED_401 = 401,
  EMAIL_ALREADY_EXISTS_409 = 409
}

@Injectable({
  providedIn: 'root'
})


export class ImageService {
  private imageListener = new Subject<Image[]>();
  private deleteImageListener = new Subject<boolean>();
  private reloadImageListener = new Subject<Image>();
  private imageErrorListener = new Subject<ImageError>();
  private imageUpdated = new Subject<boolean>();

  private viewImage: string | undefined;
  effects!: Effects;
  imageId!: number;

  constructor(private http: HttpClient, private router: Router, private authService: AuthService) {
    this.setDefaultEffect();
    this.initImageError();
  }

  setDefaultEffect(){
    this.effects = {
      saturation: 100,
      sepia: 0,
      brightness: 100,
      degrees: 0,
      isMirror: false,
      isContrast: false,
      isBlur: false
    }
  }

  getEffects() {
    return this.effects;
  }

  setEffects(effects: Effects) {
    this.effects = effects;
  }

  setImageId(imageId: number){
    this.imageId = imageId;
  }

  setImageView(viewImage: string){
    this.viewImage = viewImage;
  }

  getImageView(){
    return this.viewImage
  }

  getImageErrorListener() {
    return this.imageErrorListener.asObservable();
  }

  getReloadImageListener(){
    return this.reloadImageListener.asObservable();
  }

  getImageListener() {
    return this.imageListener.asObservable();
  }

  getImageUpdatedListener() {
    return this.imageUpdated.asObservable();
  }

  deleteImagelistener() {
    return this.deleteImageListener.asObservable();
  }

  imageUpload(image: File, effects: Effects) {
    const imageData = new FormData();

    imageData.append('saturation', effects.saturation.toString());
    imageData.append('sepia', effects.sepia.toString());
    imageData.append('brightness', effects.brightness.toString());
    imageData.append('degrees', effects.degrees.toString());
    imageData.append('isMirror', effects.isMirror.toString());
    imageData.append('isContrast', effects.isContrast.toString());
    imageData.append('isBlur', effects.isBlur.toString());
    imageData.append('image', image);

    this.http.post(BASE_URL + '/image/', imageData)
      .subscribe({
        next:(result: any) => {
          this.router.navigate(["/images"]);
        },
        error:(error: HttpErrorResponse) => {
          switch(error.status){
            case httpStatus.JWT_EXPIRED_401:
              //this.authService.refreashToken(this.imageUpload);
              break;
          }
        }
      });
  }

  getImagesByUser(){
    const token = this.authService.getAuthData();
    this.http.get(BASE_URL + '/image/')
      .subscribe({
        next:(result: any) => {
          for(let i = 0; i < result.length; i++){
            result[i].effects.isMirror = result[i].effects.isMirror === 'true' ? true : false;
            result[i].effects.isContrast = result[i].effects.isContrast === 'true' ? true : false;
            result[i].effects.isBlur = result[i].effects.isBlur === 'true' ? true : false;
          }
          this.imageListener.next(result);
        },
        error:(error:any) => {
          let imageError = this.initImageError();
          imageError.isNoResponse = true;
          this.imageErrorListener.next(imageError);
        }
      });
  }

  updateImage(effects: Effects) {
    let userId = this.authService.getUserId();
    let userIdNum = parseInt(userId);

    this.http.patch(BASE_URL + '/image/', {userId: userIdNum, imageId: this.imageId, effects})
      .subscribe({
        next:(result: any) => {
          this.imageUpdated.next(true);
        },
        error:(error: HttpErrorResponse) => {
          this.imageUpdated.next(false);
        }
      });
  }

  deleteImage(imageId: number){
    this.http.delete(BASE_URL + '/image/' + imageId)
      .subscribe({
        next:(result: any) => {
          this.deleteImageListener.next(true);
        },
        error:(err: any) => {
          this.deleteImageListener.next(false);
        }
      });
  }

  private initImageError(): ImageError {
    return {
      isNoResponse: false
    }
  }

}
