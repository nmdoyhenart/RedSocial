import { Routes } from '@angular/router';

export const routes: Routes = [
    // Redirige al login apenas entras a la raíz
    { 
    path: '', 
    loadComponent: () => import('./components/cargando/cargando.component').then(m => m.CargandoComponent) 
    }, 
    { 
        path: 'login', 
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) 
    },
    { 
        path: 'registro', 
        loadComponent: () => import('./components/registro/registro.component').then(m => m.RegistroComponent) 
    },
    { 
        path: 'publicaciones', 
        loadComponent: () => import('./components/publicaciones/publicaciones.component').then(m => m.PublicacionesComponent) 
    },
    { 
        path: 'mi-perfil', 
        loadComponent: () => import('./components/mi-perfil/mi-perfil.component').then(m => m.MiPerfilComponent) 
    },
    { 
    path: 'publicacion/:id', 
    loadComponent: () => import('./components/post-detalle/post-detalle.component').then(m => m.PostDetalleComponent) 
    },
    
    // Si el usuario escribe cualquier cosa en la URL, lo envia al login
    { path: '**', redirectTo: 'login' } 
];