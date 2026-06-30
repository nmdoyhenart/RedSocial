import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-modal-session',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-session.html',
  styleUrls: ['./modal-session.css']
})
export class ModalSesionComponent implements OnInit {
  mostrar = false;
  nombreUsuario = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Escuchamos si hay que mostrar el modal
    this.authService.mostrarModalExpiracion$.subscribe(estado => {
      this.mostrar = estado;
    });

    // Escuchamos quien esta logueado para mostrar su nombre
    this.authService.usuarioActual$.subscribe(usuario => {
      if (usuario) {
        this.nombreUsuario = usuario.nombreUsuario; 
      }
    });
  }

  extender() {
    const token = this.authService.obtenerToken();
    if (token) {
      this.authService.refrescarToken(token).subscribe({
        next: () => {
          this.mostrar = false; // Ocultamos el modal
        },
        error: () => {
          this.cerrar(); // Si falló, lo echamos
        }
      });
    }
  }

  cerrar() {
    this.mostrar = false;
    this.authService.cerrarSesion();
    this.authService.detenerTemporizadorSesion();
    this.router.navigate(['/login']);
  }
}