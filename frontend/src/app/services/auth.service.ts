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

    return this.http.post(`${this.apiUrl}/registro`, formData);
  }

  loginUsuario(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales).pipe(
      tap((respuesta: any) => {
        // Guardamos con la clave 'usuarioActual'
        localStorage.setItem('usuarioActual', JSON.stringify(respuesta));

        // Avisamos que alguien se logeó
        this.usuarioSubject.next(respuesta);
      })
    );
  }

  // --- MANEJO DE SESIÓN ---
  // Método sincrónico limpio para los componentes que necesitan el dato actualmente
  getUsuarioActual() {
    return this.usuarioSubject.getValue();
  }

  cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    this.usuarioSubject.next(null);
  }
}