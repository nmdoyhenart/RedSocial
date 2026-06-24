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

  // Variables para controlar el modal
  mostrarModal: boolean = false;
  mensajeModal: string = '';

  // Controles de estado
  cargando: boolean = false;
  mostrarContrasenia: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Mismas validaciones de seguridad que usamos en el registro
    this.loginForm = this.fb.group({
      identificador: ['', Validators.required],
      contrasenia: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/) // Al menos una mayúscula y un número
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

  toggleContrasenia() {
    this.mostrarContrasenia = !this.mostrarContrasenia;
  }

  onSubmit() {
    // VALIDACIÓN FRONTEND
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      
      const controlPass = this.loginForm.get('contrasenia');
      
      // Si la contraseña está mal escrita, atajamos el error antes de consultar al backend
      if (controlPass?.errors?.['minlength'] || controlPass?.errors?.['pattern']) {
        this.abrirModal('La contraseña debe tener un mínimo de 8 caracteres, al menos una mayúscula y un número.');
      } else {
        this.abrirModal('Por favor, completá todos los campos.');
      }
      return;
    }

    // Llamar al spinner
    this.cargando = true;

    // Petición al back
    this.authService.loginUsuario(this.loginForm.value).subscribe({
      next: () => {
        this.cargando = false;

        this.router.navigate(['/publicaciones']);
      },

      error: (error) => {
        console.error('Error en el login:', error);
        this.cargando = false; // Apagamos el spinner (si falla)
        
        // Mensaje genérico e idéntico sin importar si falló el correo o la clave.
        this.abrirModal('Credenciales incorrectas. Verificá tu usuario/correo y contraseña.');
      }
    });
  } 
}