import { Directive, HostListener, HostBinding, EventEmitter, Output } from '@angular/core';

@Directive({
  selector: '[appImageDrag]'
})
export class ImageDragDirective {
  @Output('file') fileEmitter: EventEmitter < DragEvent > = new EventEmitter();
  @HostBinding('style.background') public background = '#eee';

  constructor() { }

  @HostListener('dragover', ['$event'])
  public onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#999';
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#eee';
  }

  @HostListener('drop', ['$event']) public onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.background = '#eee';
    if(event.dataTransfer != null){
      this.fileEmitter.emit(event);
    }
  }
}
