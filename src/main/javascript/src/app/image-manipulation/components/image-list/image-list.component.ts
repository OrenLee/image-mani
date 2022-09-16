import { AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, ApplicationRef, ChangeDetectorRef, Component, DoCheck, ElementRef, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, ViewChild, ViewChildren } from '@angular/core';
import { ImageService } from '../../services/image.service';
import { Image } from '../../models/image.model';
import { Subscription, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { ImageUtil } from '../../services/image-util';
import { ImageError } from '../../models/image-error.model';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.css']
})
export class ImageListComponent implements OnInit, OnDestroy{
  images: Image[] = [];
  imageIdToDelete = -1;
  areImagesSet: boolean = false;
  isNoResponse: boolean = false;

  @ViewChildren('imageContainer') imageContainer!: QueryList<ElementRef>
  @ViewChildren('imageRef') imageRef!: QueryList<ElementRef>;
  @ViewChildren('canvasList') canvasList!: QueryList<ElementRef<HTMLCanvasElement>>;
  canvasContext!: CanvasRenderingContext2D;
  contextArray: CanvasRenderingContext2D[] = [];

  deleteImageSubscription!: Subscription;
  getImagesSubscription! : Subscription;

  constructor(private imageService: ImageService,
     private el:ElementRef,
     private router: Router,
     public dialog: MatDialog) {}

  ngOnInit(): void {
    this.imageService.getImagesByUser();

    this.getImagesSubscription = this.imageService.getImageListener()
      .subscribe(
        (res: Image[]) => {
          res.map((val) => this.images.push(val));
          this.areImagesSet = true;
        }
      );


    this.deleteImageSubscription = this.imageService.deleteImagelistener()
      .subscribe(
        (imageDeleted: boolean) => {
          if(imageDeleted){
            for(let i = 0; i < this.images.length; i++){
              if(this.images[i].id === this.imageIdToDelete){
                this.images.splice(i, 1);
              }
            }
          } else {
            this.dialog.open(DialogDeleteError, {
              restoreFocus: false,
              hasBackdrop: true,
              position: { top: '50vh', left: '50vw'}
            });
          }

        }
      );

      this.imageService.getImageErrorListener()
        .subscribe((imageError: ImageError) => {
          this.isNoResponse = imageError.isNoResponse;
        });
  }

  drawImagesToCanvas(){
    for(let i = 0; i < this.canvasList.length; i++){
      //set context
      this.contextArray[i] = (this.canvasList.get(i) as ElementRef<HTMLCanvasElement>).nativeElement.getContext('2d')!;

      //set width, height, center
      const width: number = this.imageRef.get(i)!.nativeElement.naturalWidth;
      const height: number = this.imageRef.get(i)!.nativeElement.naturalHeight;
      const centerX: number = width / 2;
      const centerY: number = height / 2;
      (this.canvasList.get(i) as ElementRef<HTMLCanvasElement>).nativeElement.width = width;
      (this.canvasList.get(i) as ElementRef<HTMLCanvasElement>).nativeElement.height = height;

      //set effects
      const contrastVal = this.images[i].effects.isContrast ? " contrast(200%)" : " ";
      const blurVal = this.images[i].effects.isBlur ? " blur(3px)" : " ";
      let fillterTemp = "saturate(" + this.images[i].effects.saturation + "%)" +
                                   " brightness(" + this.images[i].effects.brightness + "%)" +
                                   " sepia(" + this.images[i].effects.sepia + "%)" +
                                   contrastVal +
                                   blurVal;

      //set rotation
      let rotate = this.images[i].effects.degrees !== 0
                && this.images[i].effects.degrees !== 180 ? true : false;
      if(rotate){
        (this.canvasList.get(i) as ElementRef<HTMLCanvasElement>).nativeElement.width = height;
        (this.canvasList.get(i) as ElementRef<HTMLCanvasElement>).nativeElement.height = width;
      }
      this.contextArray[i].filter = fillterTemp;
      ImageUtil.drawImage(rotate, this.images[i].effects, {width, height},  this.imageRef.get(i)!, this.canvasList.get(i)!, this.contextArray[i]);
    }
  }

  deleteImage(imageIdToDelete: number) {
    this.imageIdToDelete = imageIdToDelete;
    let index: number = -1;
    for(let i = 0; i < this.images.length; i++){
      if(this.images[i].id === imageIdToDelete){
        index = i;
        this.images.splice(i, 1);
      }
    }
    this.contextArray.splice(index, 1);
    this.imageService.deleteImage(imageIdToDelete);
  }


  reloadImage(image: Image): void {
    this.router.navigate(['/']);
    this.imageService.setImageView('data:image/jpeg;base64,' + image.image);
    this.imageService.setEffects(image.effects);
    this.imageService.setImageId(image.id);
  }

  ngOnDestroy(): void {
    this.deleteImageSubscription.unsubscribe();
    this.getImagesSubscription.unsubscribe();
  }
}

@Component({
  selector: 'dialog-delete-error',
  template: `<p>Could not delete image, try again later</p>`
})
export class DialogDeleteError {}
