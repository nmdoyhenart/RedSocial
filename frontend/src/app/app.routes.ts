import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegistroComponent } from './components/registro/registro.component';
import { PublicacionesComponent } from './components/publicaciones/publicaciones.component';
import { MiPerfilComponent } from './components/mi-perfil/mi-perfil.component';

export const routes: Routes = [
    // Redirige al login apenas entras a localhost:4200
    { path: '', redirectTo: 'login', pathMatch: 'full' }, 
    { path: 'login', component: LoginComponent },
    { path: 'registro', component: RegistroComponent },
    { path: 'publicaciones', component: PublicacionesComponent },
    { path: 'mi-perfil', component: MiPerfilComponent },
    // Si el usuario escribe cualquier cosa en la URL, lo mandamos al login
    { path: '**', redirectTo: 'login' } 
];