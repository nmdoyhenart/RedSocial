import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {
  private apiUrl = `${environment.apiUrl}/estadisticas`;

  constructor(private http: HttpClient) {}

  obtenerPostsPorUsuario(desde?: string, hasta?: string) {
    let params = new HttpParams();
    if (desde) {
      params = params.set('desde', desde);
    }
    if (hasta) {
      params = params.set('hasta', hasta);
    }
    return this.http.get<any[]>(`${this.apiUrl}/posts`, { params });
  }

  obtenerComentariosPorUsuario(desde?: string, hasta?: string) {
    let params = new HttpParams();
    if (desde) {
      params = params.set('desde', desde);
    }
    if (hasta) {
      params = params.set('hasta', hasta);
    }
    return this.http.get<any[]>(`${this.apiUrl}/comentarios`, { params });
  }

  obtenerComentariosPorPublicacion(desde?: string, hasta?: string) {
    let params = new HttpParams();
    if (desde) params = params.set('desde', desde);
    if (hasta) params = params.set('hasta', hasta);
    return this.http.get<any[]>(`${this.apiUrl}/comentarios-por-publicacion`, { params });
  }
}