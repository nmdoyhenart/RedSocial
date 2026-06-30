import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cargando',
  standalone: true,
  templateUrl: './cargando.html',
  styleUrls: ['./cargando.css']
})
export class CargandoComponent implements OnInit {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.verificarSesion();
  }

  verificarSesion() {
    const token = this.authService.obtenerToken();

    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.autorizarToken(token).subscribe({
      next: (usuarioValido) => {
        
        this.authService.iniciarTemporizadorSesion();
        this.router.navigate(['/publicaciones']);
      },
      error: () => {

        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
      }
    });
  }
}