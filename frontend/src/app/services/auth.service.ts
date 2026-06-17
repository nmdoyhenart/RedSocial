import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';

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
    return this.http.post(`${this.apiUrl}/registro`, formData);
  }
}