import { Directive, ElementRef, AfterViewInit } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]',
  standalone: true
})
export class AutoFocusDirective implements AfterViewInit {
  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    // setTimeout(0) evita conflictos con animaciones de apertura del modal
    setTimeout(() => this.el.nativeElement.focus(), 0);
  }
}