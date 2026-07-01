import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'tiempoRelativo', standalone: true })
export class TiempoRelativoPipe implements PipeTransform {
  transform(fecha: string | Date | undefined | null): string {
    if (!fecha) return '';

    const ahora = new Date().getTime();
    const entonces = new Date(fecha).getTime();
    const segundos = Math.floor((ahora - entonces) / 1000);

    if (segundos < 60) return 'hace un momento';

    const minutos = Math.floor(segundos / 60);
    if (minutos < 60) return `hace ${minutos} min`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;

    const dias = Math.floor(horas / 24);
    if (dias < 30) return `hace ${dias} d`;

    const meses = Math.floor(dias / 30);
    if (meses < 12) return `hace ${meses} mes${meses > 1 ? 'es' : ''}`;

    const anios = Math.floor(dias / 365);
    return `hace ${anios} año${anios > 1 ? 's' : ''}`;
  }
}