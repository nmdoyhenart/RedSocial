import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncarTexto', standalone: true })
export class TruncarTextoPipe implements PipeTransform {
  transform(texto: string | undefined | null, limite: number = 100): string {
    if (!texto) return '';
    return texto.length > limite ? texto.slice(0, limite).trim() + '...' : texto;
  }
}