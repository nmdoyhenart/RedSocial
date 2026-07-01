import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private apiUrl = `${environment.apiUrl}/usuarios`; 

  constructor(private http: HttpClient) {}

  // Helper para inyectar el token en las peticiones
  private getHeaders() {
    const token = localStorage.getItem('token'); 
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // GET: Trae la lista de todos los usuarios
  obtenerUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, this.getHeaders());
  }

  // POST: Crea un nuevo usuario
  crearUsuario(usuarioData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, usuarioData, this.getHeaders());
  }

  // DELETE: Baja lógica (Deshabilitar)
  deshabilitarUsuario(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, this.getHeaders());
  }

  // POST: Alta lógica (Rehabilitar)
  rehabilitarUsuario(id: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${id}/alta`, {}, this.getHeaders());
  }
}