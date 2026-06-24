import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private apiUrl = `${environment.apiUrl}/posts`; // ${environment.apiUrl}/posts

  constructor(private http: HttpClient) {}

  // Obtener publicaciones (paginación y orden)
  getPosts(limit: number, offset: number, orderBy: string, userId?: string): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset)
      .set('orderBy', orderBy);

    // Si alguien nos manda un ID, lo sumamos al paquete
    if (userId) {
      params = params.set('userId', userId);
    }

    return this.http.get<any>(this.apiUrl, { params });
  }

  // Crear publicación
  createPost(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }

  // Dar Me Gusta
  likePost(postId: string, userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${postId}/like`, { userId });
  }

  // Quitar Me Gusta
  unlikePost(postId: string, userId: string): Observable<any> {
    // Delete
    return this.http.delete<any>(`${this.apiUrl}/${postId}/like`, { body: { userId } });
  }

  // Borrar Publicación
  deletePost(postId: string, userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${postId}`, { body: { userId } });
  }
}