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

  // Variables para controlar el modal estándar (validaciones/credenciales)
  mostrarModal: boolean = false;
  mensajeModal: string = '';

  // NUEVO: Variable para controlar el modal crítico de suspensión
  mostrarModalDenegado: boolean = false;

  // Controles de estado
  cargando: boolean = false;
  mostrarContrasenia: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      identificador: ['', Validators.required],
      contrasenia: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/) 
      ]]
    });
  }

  abrirModal(mensaje: string) {
    this.mensajeModal = mensaje;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  // NUEVO: Función para cerrar el modal crítico
  cerrarModalDenegado() {
    this.mostrarModalDenegado = false;
  }

  toggleContrasenia() {
    this.mostrarContrasenia = !this.mostrarContrasenia;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      const controlPass = this.loginForm.get('contrasenia');
      
      if (controlPass?.errors?.['minlength'] || controlPass?.errors?.['pattern']) {
        this.abrirModal('La contraseña debe tener un mínimo de 8 caracteres, al menos una mayúscula y un número.');
      } else {
        this.abrirModal('Por favor, completá todos los campos.');
      }
      return;
    }

    this.cargando = true;

    this.authService.loginUsuario(this.loginForm.value).subscribe({
      next: () => {
        this.cargando = false;
        this.router.navigate(['/publicaciones']);
      },
      error: (error) => {
        console.error('Error en el login:', error);
        this.cargando = false; 
        
        // INTERCEPTAMOS LA BARRERA DEL BACKEND
        if (error.error?.message === 'USUARIO_DESHABILITADO') {
          this.mostrarModalDenegado = true; // Dispara el modal rojo
        } else {
          // Si es un error normal, usamos tu modal estándar
          this.abrirModal('Credenciales incorrectas. Verificá tu usuario/correo y contraseña.');
        }
      }
    });
  } 
}