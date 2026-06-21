import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth'; // ${environment.apiUrl}/auth

  constructor(private http: HttpClient) {}

  private usuarioSubject = new BehaviorSubject<any>(this.obtenerUsuarioDeStorage());
  
  public usuarioActual$ = this.usuarioSubject.asObservable();

  private obtenerUsuarioDeStorage() {
    const userString = localStorage.getItem('usuarioActual');
    
    if (!userString) return null; // Si no hay nada, devuelve null

    try {
      return JSON.parse(userString);
    } catch (error) {
      // Si el JSON está corrupto (bugeado), limpia la memoria y devuelve null
      console.warn('Datos de sesión corruptos detectados. Limpiando...');
      localStorage.removeItem('usuarioActual');
      return null;
    }
  }

  // Recibe los datos del componente
  registrarUsuario(datosFormulario: any, imagen: File): Observable<any> {
    const formData = new FormData();

  // Iteramos los campos y descartamos el que no le sirve al backend
  Object.keys(datosFormulario).forEach(key => {
    if (key !== 'repetirContrasenia') {
      formData.append(key, datosFormulario[key]);
    }
  });

    // Adjuntamos el archivo
    formData.append('imagen', imagen);

    // Hacamos la petición al servidor
    return this.http.post(`${this.apiUrl}/registro`, formData);
  }

  // LOGIN: Guarda en memoria y avisa
  loginUsuario(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credenciales).pipe(
      tap((respuesta: any) => {
        localStorage.setItem('usuarioActual', JSON.stringify(respuesta));
        this.usuarioSubject.next(respuesta);
      })
    );
  }

  // --- MANEJO DE SESIÓN ---
  setUsuarioActual(usuario: any) {
    // Guardamos el objeto entero del usuario en el navegador
    localStorage.setItem('fogon_usuario', JSON.stringify(usuario));
  }

  getUsuarioActual() {
    // Recuperamos el usuario. Si no hay nadie, devolvemos null
    const usuarioString = localStorage.getItem('fogon_usuario');
    return usuarioString ? JSON.parse(usuarioString) : null;
  }

  // Borra la memoria y avisa
  cerrarSesion() {
    localStorage.removeItem('usuarioActual');
    this.usuarioSubject.next(null);
  }
}