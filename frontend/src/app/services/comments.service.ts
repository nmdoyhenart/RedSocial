import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private apiUrl = `${environment.apiUrl}/comentarios`;

  constructor(private http: HttpClient) {}

  // GET: Trae comentarios con paginación
  obtenerComentarios(postId: string, limit: number, offset: number): Observable<any> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get(`${this.apiUrl}/${postId}`, { params });
  }

  // POST: Crea un comentario nuevo
  agregarComentario(postId: string, mensaje: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${postId}`, { mensaje });
  }

  // PUT: Modifica un comentario existente
  modificarComentario(commentId: string, mensaje: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${commentId}`, { mensaje });
  }
}