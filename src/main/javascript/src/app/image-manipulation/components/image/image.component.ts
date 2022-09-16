import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, DoCheck, Inject, HostListener } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ImageCroppedEvent, ImageCropperComponent, LoadedImage } from 'ngx-image-cropper';
import { BehaviorSubject, identity, Observable, Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { ImageService } from '../../services/image.service';
import { Image } from '../../models/image.model';
import { ImageUtil } from '../../services/image-util';
import { MatSliderChange } from '@angular/material/slider';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { Effects } from '../../models/effects.model';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDrawerMode, MatSidenav } from '@angular/material/sidenav';

export interface DialogData {
  isImageUpdated: boolean;
}

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.css']
})
export class ImageComponent implements OnInit, OnDestroy  {
  //Canvas
  @ViewChild('canvas', {static: true})
  canvas!: ElementRef<HTMLCanvasElement>;
  canvasContext!: CanvasRenderingContext2D;
  dimensions!: {width: number, height: number};
  canvasInitialized: boolean = false;

  //SideNav
  showToggle!: string;
  private screenWidth$ = new BehaviorSubject<number>
  (window.innerWidth);
  openSidenav!: boolean;
  @ViewChild('sidenav') sidenav!: MatSidenav;

  selectEffects!: any;

  imageSent = false;
  newFile! : File;

  //Effects
  effects!: Effects;

  imageData!: ImageData;
  imageDataContrast!: ImageData;
  mirrorEffect = new FormControl('');

  form!: FormGroup;
  openedSideBar = true;
  originalImage!: any;
  @ViewChild('imageRef')
  imageRef!: ElementRef;
  fileImage!: File;
  imageloaded = false;
  imageReloaded = false;
  croppedEffect = false;
  cropperImageWidth!: string;

  @ViewChild('filePicker')
  filePicker!: ElementRef;

  isNewImage = false;

  @ViewChild(ImageCropperComponent)
  cropperTest!: ElementRef;

  imageChangedEvent: any = '';
  croppedImage: any = '';

  loggedIn?: boolean;
  authStatusListener = new Subscription();
  imageReloadListener = new Subscription();
  imageUpdateListener = new Subscription();

  constructor(private imageService: ImageService,
              private authService: AuthService,
              public dialog: MatDialog) {}

  ngOnInit(): void {
    this.getScreenWidth().subscribe(width => {
      if (width < 640) {
       this.showToggle = 'show';
       this.openSidenav = false;
     }
     else if (width > 640) {
       this.showToggle = 'hide';
       this.openSidenav = true;
     }
   });

    this.effects = this.imageService.getEffects();

    this.loggedIn = this.authService.isLoggedIn();
    this.form = new FormGroup({
      title: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)]
      }),
      image: new FormControl(null, {
        validators: [Validators.required]
      })
    });

    this.authStatusListener = this.authService
    .getAuthLoginListener()
    .subscribe(res => {
      this.loggedIn = res;
    })

    this.imageUpdateListener = this.imageService
    .getImageUpdatedListener()
    .subscribe((isImageUpdated: boolean) => {
      this.dialog.open(DialogConfirmUpdate, {
        restoreFocus: false,
        hasBackdrop: true,
        position: { top: '50vh', left: '50vw'},
        data: { isImageUpdated }
      });
    });

    const viewImage = this.imageService.getImageView();

    if(viewImage != undefined){
      this.croppedImage = viewImage;
      this.originalImage = viewImage;
      this.imageReloaded = true;
      //this.applyImageChange();
      this.originalImageToFile();
    }

    this.authService.autoLoginJwt();
  }

  imageLoadedDraw() {
    this.canvasContext = this.canvas.nativeElement.getContext('2d')!;
    const width: number = this.imageRef.nativeElement.naturalWidth;
    const height: number = this.imageRef.nativeElement.naturalHeight;

    if(width > 0 && height > 0){
      //Dimensions
      this.dimensions = {width, height};
      this.dimensions = ImageUtil.fitRatio(width, height);
      this.canvas.nativeElement.width = this.dimensions.width;
      this.canvas.nativeElement.height = this.dimensions.height;

      //Data and Draw
      this.arrageFillters(this.effects.sepia, this.effects.brightness, this.effects.saturation, this.effects.isContrast, this.effects.isBlur);
      if(this.effects.degrees !== 0 && this.effects.degrees !== 180){
        this.rotateCanvasImage('stay');
      }
      this.drawImage(false);
      let imageData: ImageData = this.canvasContext.getImageData(0,0, this.dimensions.width, this.dimensions.height);
      this.imageData = imageData;
      this.canvasInitialized = true;
    }
  }

  applyImageEffects(event: MatSliderChange, mode:string){
    const value = event.value;
    switch(mode){
      case "sepia": this.arrageFillters(value!, this.effects.brightness, this.effects.saturation, this.effects.isContrast, this.effects.isBlur); break;
      case "brightness": this.arrageFillters(this.effects.sepia, value!, this.effects.saturation, this.effects.isContrast, this.effects.isBlur); break;
      case "saturation": this.arrageFillters(this.effects.sepia, this.effects.brightness, value!, this.effects.isContrast, this.effects.isBlur); break;
    }
  }


  valueLabel(value: number) {
    return value;
  }

  doubleValueLabel(value: number){
    return value / 2;
  }

  private arrageFillters(sepia: number, brightness: number, saturation: number, contrast: boolean, blur: boolean){
    const contrastVal = contrast ? " contrast(200%)" : " ";
    const blurVal = blur ? " blur(1px)" : " ";
    this.canvasContext.filter = "saturate(" + saturation + "%)" +
                                " brightness(" + brightness + "%)" +
                                " sepia(" + sepia + "%)" +
                                contrastVal +
                                blurVal;

    this.drawImage(false);
  }

  onImageSelected(event: Event) {
    this.setDefaultEffect();
    this.isNewImage = true;
    this.canvasInitialized = false;
    this.croppedEffect = false;
    const file = (event.target as HTMLInputElement)?.files?.[0];
    this.fileToBase64(file!);
  }

  onImageDropped(event: DragEvent) {
    this.setDefaultEffect();
    this.isNewImage = true;
    this.canvasInitialized = false;
    this.croppedEffect = false;
    if(event.dataTransfer != null){
      this.fileImage = event.dataTransfer.files[0];
    }
    this.fileToBase64(this.fileImage);
  }

  private fileToBase64(file: File){
    this.form.patchValue({ image: file });
    const reader = new FileReader();
    reader.onload = () => {
      this.croppedImage = reader.result as string;
      this.originalImage = reader.result as string;
    };
    reader.readAsDataURL(file!);

    reader.onloadend = () =>{
      this.fileImage = file!;
      this.imageloaded = true;
    }
  }

  resetImage(){
    this.setDefaultEffect();
    this.canvasContext.filter = "none";
    this.drawImage(false);
    this.effects.isMirror = false;
    this.selectEffects = undefined;
  }


  fileDropped(file: File) {
    this.fileImage = file;
  }

  imageUploadCanvas(){
    this.originalImageToFile();
    this.imageService.imageUpload(this.fileImage, {
      sepia: this.effects.sepia, brightness: this.effects.brightness,
       saturation: this.effects.saturation, degrees: this.effects.degrees,
       isMirror: this.effects.isMirror, isContrast: this.effects.isContrast, isBlur: this.effects.isBlur
      });
  }

  updateImage() {
    this.imageService.updateImage(this.effects);
  }

  rotateCanvasImage(direction: string){
    let toRotate = true;
    const effectsFiller = this.canvasContext.filter;
    switch(direction){
      case 'right': this.effects.degrees += 90; break;
      case 'left': this.effects.degrees -= 90; break;
      case 'stay': toRotate = false; break;
    }
    if(this.effects.degrees / 360 === 1 || this.effects.degrees / 360 === -1){
      this.effects.degrees = 0;
    }
    if(this.effects.degrees === -90){
      this.effects.degrees = 270;
    }

    this.canvas.nativeElement.width = this.dimensions.height;
    this.canvas.nativeElement.height = this.dimensions.width;
    this.canvasContext.filter = effectsFiller;

    this.drawImage(toRotate);

    //Dimensions
    const tempDWidth = this.dimensions.width;
    this.dimensions.width = this.dimensions.height;
    this.dimensions.height = tempDWidth;
  }

  private drawImage(isRotated: boolean){
    ImageUtil.drawImage(isRotated, this.effects, this.dimensions, this.imageRef, this.canvas, this.canvasContext);
  }

  groupEffect(event: MatButtonToggleChange){
    if(event.value.includes('mirror') && !this.effects.isMirror || !event.value.includes('mirror') && this.effects.isMirror){
      this.effects.isMirror = !this.effects.isMirror;
    }
    if(event.value.includes('contrast') && !this.effects.isContrast || !event.value.includes('contrast') && this.effects.isContrast){
      this.effects.isContrast = !this.effects.isContrast;
      this.arrageFillters(this.effects.sepia, this.effects.brightness, this.effects.saturation, this.effects.isContrast, this.effects.isBlur);;
    }
    if(event.value.includes('blur') && !this.effects.isBlur || !event.value.includes('blur') && this.effects.isBlur){
      this.effects.isBlur = !this.effects.isBlur;
      this.arrageFillters(this.effects.sepia, this.effects.brightness, this.effects.saturation, this.effects.isContrast, this.effects.isBlur);;
    }

    this.drawImage(false);

  }

  cropImage(event: Event){
    this.croppedEffect = true;
  }

  fileChangeEvent(event: any): void { //hideResizeSquares marginLeft
    //this.imageChangedEvent = event;
  }

  cropImageAction(){
    this.croppedEffect = false;
  }


  private originalImageToFile() {
      const imageBlob = this.dataURItoBlob(this.originalImage.split(',')[1]);
      const imageName = 'name.png';
      this.fileImage = new File([imageBlob], imageName, { type: 'image/png' });
  }

  private dataURItoBlob(dataURI: any) {
    const byteString = atob(dataURI);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/png' });
    return blob;
 }

 downloadImage() {
    const canvasURL = this.canvas.nativeElement.toDataURL();
    const link = document.createElement('a');
    document.body.appendChild(link); //For firefox

    link.setAttribute('href', canvasURL);
    link.setAttribute('download', 'image.jpg');
    link.click();
 }

 @HostListener('window:resize', ['$event'])
 onResize(event: { target: { innerWidth: any; }; }) {
   this.screenWidth$.next(event.target.innerWidth);
 }
 getScreenWidth(): Observable<number> {
   return this.screenWidth$.asObservable();
 }

 private setDefaultEffect(){
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

 ngOnDestroy(): void {
  this.authStatusListener.unsubscribe();
  this.imageReloadListener.unsubscribe();
  this.imageUpdateListener.unsubscribe();
 }

}

@Component({
  selector: 'dialog-confirm-update',
  template: `<p *ngIf="data.isImageUpdated">Image Was Updated Successfully</p>
             <p *ngIf="!data.isImageUpdated">Image Was Not Able To Update, Please Try Again Later</p>`
})
export class DialogConfirmUpdate {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
