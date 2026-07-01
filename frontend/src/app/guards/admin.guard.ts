import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {}

    canActivate(): Observable<boolean | UrlTree> {
        return this.authService.usuarioActual$.pipe(
        take(1), // Tomamos el valor actual y cortamos la suscripción
        map(usuario => {
            // Verificamos si hay un usuario logueado y si su perfil es 'administrador'
            if (usuario && usuario.perfil === 'administrador') {
            return true;
            }
            
            // Si no es admin, lo desviamos automáticamente al feed principal
            return this.router.createUrlTree(['/publicaciones']);
        })
        );
    }
}