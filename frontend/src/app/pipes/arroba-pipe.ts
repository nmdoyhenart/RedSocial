import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'arroba', standalone: true })
export class ArrobaPipe implements PipeTransform {
  transform(nombreUsuario: string | undefined | null): string {
    return nombreUsuario ? `@${nombreUsuario}` : '';
  }
}