import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router'; // 1. Importamos el Router
import { AuthService } from '../../services/auth.service'; // Ajustá la ruta según tu proyecto

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent implements OnInit {
  usuarioActual: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Escuchamos para saber si hay alguien logueado al instante
    this.authService.usuarioActual$.subscribe(user => {
      this.usuarioActual = user;
    });
  }

  cerrarSesion() {
    // Ejecutamos el método del servicio para borrar la memoria
    this.authService.cerrarSesion();
    
    // Redirigimos al login usando el Router
    this.router.navigate(['/login']);
  }
}