import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://socialnetwork-tp2-backend.onrender.com';

  constructor(private http: HttpClient) {}

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
    return this.http.post(`${this.apiUrl}/auth/registro`, formData);
  }

  loginUsuario(credenciales: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, credenciales);
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

  cerrarSesion() {
    localStorage.removeItem('fogon_usuario');
  }
}