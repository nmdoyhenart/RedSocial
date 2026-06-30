import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Buscamos el token en el navegador
  const token = localStorage.getItem('token');

  // Si hay token, clonamos la petición y le inyectamos la cabecera
  let peticion = req;
  if (token) {
    peticion = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Dejamos que la petición viaje al backend, pero si hay un error respondemos
  return next(peticion).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si devuelve error 401, redirige al login
      if (error.status === 401) {
        
        // Apagamos el reloj del temporizador de sesión
        authService.detenerTemporizadorSesion();

        // Borramos el token vencido/invalido
        localStorage.removeItem('token');
        
        // Lo pateamos al login
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};