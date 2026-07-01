import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appResaltarHover]',
  standalone: true
})
export class ResaltarHoverDirective {
  @Input() appResaltarHover: string = 'rgba(99, 102, 241, 0.12)';

  private colorOriginal: string = '';

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('mouseenter') alEntrar(): void {
    this.colorOriginal = this.el.nativeElement.style.backgroundColor;
    this.el.nativeElement.style.backgroundColor = this.appResaltarHover;
    this.el.nativeElement.style.transition = 'background-color 0.2s ease';
  }

  @HostListener('mouseleave') alSalir(): void {
    this.el.nativeElement.style.backgroundColor = this.colorOriginal;
  }
}