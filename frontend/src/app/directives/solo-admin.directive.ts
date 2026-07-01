import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appSoloAdmin]',
  standalone: true
})
export class SoloAdminDirective {
  private creado = false;

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef
  ) {}

  @Input() set appSoloAdmin(esAdmin: boolean | undefined | null) {
    if (esAdmin && !this.creado) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.creado = true;
    } else if (!esAdmin && this.creado) {
      this.viewContainer.clear();
      this.creado = false;
    }
  }
}