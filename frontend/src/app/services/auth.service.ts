import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  private usuarioSubject = new BehaviorSubject<any>(this.obtenerUsuarioDeStorage());
  public usuarioActual$ = this.usuarioSubject.asObservable();

  // Variables para el temporizador
  private timeoutId: any;
  public mostrarModalExpiracion$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  // Busca en la memoria al iniciar
  private obtenerUsuarioDeStorage() {
    const userString = localStorage.getItem('usuarioActual');
    
    if (!userString) return null;

    try {
      return JSON.parse(userString);
    } catch (error) {
      console.warn('Datos de sesión corruptos detectados. Limpiando...');
      localStorage.removeItem('usuarioActual');
      return null;
    }
  }

  registrarUsuario(datosFormulario: any, imagen: File): Observable<any> {
    const formData = new FormData();

    Object.keys(datosFormulario).forEach(key => {
      if (key !== 'repetirContrasenia') {
        formData.append(key, datosFormulario[key]);
      }
    });

    formData.append('imagen', imagen);

    // Agregamos el tap para interceptar el token de bienvenida
    return this.http.post(`${this.apiUrl}/registro`, formData).pipe(
      tap((respuesta: any) => {
        if (respuesta.token) this.guardarToken(respuesta.token);
        if (respuesta.usuario) {
          localStorage.setItem('usuarioActual', JSON.stringify(respuesta.usuario));
          this.usuarioSubject.next(respuesta.usuario);
        }
        this.iniciarTemporizadorSesion();
      })
    );
  }

  loginUsuario(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales).pipe(
      tap((respuesta: any) => {
        // Separamos el guardado del token y de los datos del usuario
        if (respuesta.token) this.guardarToken(respuesta.token);
        if (respuesta.usuario) {
          localStorage.setItem('usuarioActual', JSON.stringify(respuesta.usuario));
          this.usuarioSubject.next(respuesta.usuario);
        }
        this.iniciarTemporizadorSesion();
      })
    );
  }

  iniciarTemporizadorSesion() {
    this.detenerTemporizadorSesion(); // Limpiamos relojes viejos (si los hay)
    
    // 10 minutos en milisegundos: 10 * 60 * 1000 = 600000
    this.timeoutId = setTimeout(() => {
      this.mostrarModalExpiracion$.next(true); // Mostramos el modal
    }, 600000); 
  }

  detenerTemporizadorSesion() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.mostrarModalExpiracion$.next(false);
  }

  // --- MANEJO DE SESIÓN ---
  getUsuarioActual() {
    return this.usuarioSubject.getValue();
  }

  cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    this.eliminarToken(); // Borramos el token JWT
    this.usuarioSubject.next(null);
  }

  // Helpers para token JWT
  guardarToken(token: string) {
    localStorage.setItem('token', token);
  }

  obtenerToken(): string | null {
    return localStorage.getItem('token');
  }

  eliminarToken() {
    localStorage.removeItem('token');
  }

  autorizarToken(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/autorizar`, { token });
  }

  refrescarToken(token: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/refrescar`, { token }).pipe(
      tap((res: any) => {
        if (res.token) {
          this.guardarToken(res.token);
          this.iniciarTemporizadorSesion(); // Reiniciamos el contador
        }
      })
    );
  }
}