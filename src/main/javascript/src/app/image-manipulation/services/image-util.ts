import { ElementRef } from "@angular/core";
import { Effects } from "../models/effects.model";

export class ImageUtil {
  static MAX_HEIGHT = 576;// 768 576
  static MAX_WIDTH = 1024;// 1024

  static blackAndWhite(imageData: ImageData) {
    for (let j = 0; j < imageData.height; j++)
    {
      for (let i=0; i<imageData.width; i++)
      {
         const index = (i*4) * imageData.width + (j*4);
         const red = imageData.data[index];
         const green = imageData.data[index+1];
         const blue = imageData.data[index+2];
         const alpha = imageData.data[index+3];
         const average = (red+green+blue)/3;
         imageData.data[index]=average;
         imageData.data[index+1]=average;
         imageData.data[index+2]=average;
         imageData.data[index+3]=alpha;
       }
     }

  }

  static fitRatio(width: number, height: number) {
    if(width > ImageUtil.MAX_WIDTH){
        const ratio = width / ImageUtil.MAX_WIDTH;
        width = ImageUtil.MAX_WIDTH;
        height = height / ratio;
    }
    if(height > ImageUtil.MAX_HEIGHT){
      const ratio = height / ImageUtil.MAX_HEIGHT;
      height = ImageUtil.MAX_HEIGHT;
      width = width / ratio;
     }
     return { width, height};
  }

  static drawImage(isRotated: boolean, effects: Effects, dimensions: {width: number, height: number},
    imageRef: ElementRef, canvas: ElementRef<HTMLCanvasElement>, canvasContext: CanvasRenderingContext2D) {

    const width: number = imageRef.nativeElement.naturalWidth;
    const height: number = imageRef.nativeElement.naturalHeight;

    const scaleMin = Math.min(dimensions.width / width,
                            dimensions.height / height);

    const scaleMax = Math.max(dimensions.width / height,
                          dimensions.height / width);

    const canvasWidth = canvas.nativeElement.width;
    const canvasHeight = canvas.nativeElement.height;

    let mirrorScale = 1;
    let cancelMirror = 1;
    let mirrorWidth = 0;
    let mirrorHeight = 0;
    if(effects.isMirror){
      mirrorScale = -1;
      cancelMirror = 0;
      mirrorWidth = canvasWidth;
      mirrorHeight = canvasHeight;
    }

    if(isRotated){
      switch(effects.degrees){
        case 0: canvasContext.setTransform(scaleMax * mirrorScale, 0, 0, scaleMax, mirrorWidth, 0); break;
        case 90: canvasContext.setTransform(0, scaleMin * mirrorScale, -scaleMin, 0, canvasWidth, mirrorHeight);  break;
        case 180: canvasContext.setTransform(-scaleMax * mirrorScale, 0, 0, -scaleMax, canvasWidth * cancelMirror, canvasHeight); break;
        case 270: canvasContext.setTransform(0, -scaleMin * mirrorScale, scaleMin, 0, 0, canvasHeight * cancelMirror);
      }
    } else {
      switch(effects.degrees){
        case 0: canvasContext.setTransform(scaleMin * mirrorScale, 0, 0, scaleMin, mirrorWidth, 0);  break;
        case 90: canvasContext.setTransform(0, scaleMax * mirrorScale, -scaleMax, 0, canvasWidth, mirrorHeight); break;
        case 180: canvasContext.setTransform(-scaleMin * mirrorScale, 0, 0, -scaleMin, canvasWidth * cancelMirror, canvasHeight); break;
        case 270: canvasContext.setTransform(0, -scaleMax * mirrorScale, scaleMax, 0, 0, canvasHeight * cancelMirror);
      }
    }
    canvasContext.drawImage(imageRef.nativeElement, 0,0);
  }
}
