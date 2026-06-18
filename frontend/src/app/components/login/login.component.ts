import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identificador: ['', Validators.required],
      contrasenia: ['', Validators.required]
    });
  }

  // Variables para controlar el modal
  mostrarModal: boolean = false;
  mensajeModal: string = '';

  // Variable de control mostrar/ocultar contraseña
  mostrarContrasenia: boolean = false;

  // Funciones para abrir y cerrar
  abrirModal(mensaje: string) {
    this.mensajeModal = mensaje;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  toggleContrasenia() {
    this.mostrarContrasenia = !this.mostrarContrasenia;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authService.loginUsuario(this.loginForm.value).subscribe({
      next: (respuesta) => {
        this.authService.setUsuarioActual(respuesta); 
        this.router.navigate(['/publicaciones']);
      },

      error: (error) => {
        console.error('Error en el login:', error);
        this.abrirModal('Credenciales inválidas. Revisá tu usuario o correo y/o contraseña.');
      }
    });
    }; 
  }