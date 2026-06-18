import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent {
  registroForm: FormGroup;
  archivoSeleccionado: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      nombreUsuario: ['', Validators.required],
      contrasenia: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/) 
      ]],
      repetirContrasenia: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      descripcion: ['', Validators.required],
      perfil: ['usuario', Validators.required] 
    }, { validators: this.passwordsIguales }); 
  }

  // Variables para controlar el modal
  mostrarModal: boolean = false;
  mensajeModal: string = '';
  esExito: boolean = false;

  // Variables para controlar mostrar/ocultar contraseña
  mostrarContrasenia: boolean = false;
  mostrarRepetir: boolean = false;

  toggleContrasenia() {
    this.mostrarContrasenia = !this.mostrarContrasenia;
  }

  toggleRepetir() {
    this.mostrarRepetir = !this.mostrarRepetir;
  }

  // Funciones para abrir y cerrar
  abrirModal(mensaje: string, exito: boolean = false) {
    this.mensajeModal = mensaje;
    this.esExito = exito;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
    if (this.esExito) {
      this.router.navigate(['/login']); 
    }
  }

  passwordsIguales(control: AbstractControl) {
    const pass = control.get('contrasenia')?.value;
    const repPass = control.get('repetirContrasenia')?.value;
    
    if (pass !== repPass) {
      control.get('repetirContrasenia')?.setErrors({ noCoinciden: true });
      return { noCoinciden: true };
    }
    return null;
  }

  // Recuperamos la función para que el input file funcione
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    if (!this.archivoSeleccionado) {
      this.abrirModal('La imagen de perfil es obligatoria.'); 
      return;
    }

    this.authService.registrarUsuario(this.registroForm.value, this.archivoSeleccionado)
      .subscribe({
        next: () => {
          this.abrirModal('¡Usuario registrado con éxito! Ya podés iniciar sesión.', true);
        },
        error: (error) => {
          console.error('Error al registrar:', error);
          this.abrirModal('Hubo un error en el registro.');
        }
      });
  }
}