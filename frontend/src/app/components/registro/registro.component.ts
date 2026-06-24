import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

export function edadMinimaValidator(edadMinima: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null; 

    const fechaNacimiento = new Date(control.value);
    const hoy = new Date();
    
    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const diferenciaMeses = hoy.getMonth() - fechaNacimiento.getMonth();

    if (diferenciaMeses < 0 || (diferenciaMeses === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
      edad--;
    }

    return edad < edadMinima ? { menorDeEdad: true } : null;
  };
}

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

  // Variables de estado
  mostrarModal: boolean = false;
  mensajeModal: string = '';
  esExito: boolean = false;
  cargando: boolean = false;
  
  mostrarContrasenia: boolean = false;
  mostrarRepetir: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
      this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', Validators.required],
      nombreUsuario: ['', Validators.required],
      contrasenia: ['', Validators.required],
      repetirContrasenia: ['', Validators.required],
      fechaNacimiento: ['', [Validators.required, edadMinimaValidator(13)]],
      descripcion: ['', Validators.required],
      perfil: ['usuario', Validators.required] 
    }, { validators: this.passwordsIguales }); 
  }

  toggleContrasenia() { this.mostrarContrasenia = !this.mostrarContrasenia; }
  toggleRepetir() { this.mostrarRepetir = !this.mostrarRepetir; }

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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  onSubmit() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      
      // 1. Validar la Edad
      if (this.registroForm.get('fechaNacimiento')?.errors?.['menorDeEdad']) {
        this.abrirModal('Tenés que tener al menos 13 años para registrarte.');
        return;
      }

      // 2. Validar la Contraseña (Longitud y Patrón)
      const controlPass = this.registroForm.get('contrasenia');
      if (controlPass?.errors?.['minlength']) {
        this.abrirModal('La contraseña es muy corta. Debe tener al menos 8 caracteres.');
        return;
      }
      if (controlPass?.errors?.['pattern']) {
        this.abrirModal('La contraseña debe contener al menos una letra mayúscula y un número.');
        return;
      }

      // 3. Validar que las contraseñas coincidan
      if (this.registroForm.get('repetirContrasenia')?.errors?.['noCoinciden']) {
        this.abrirModal('Las contraseñas no coinciden.');
        return;
      }

      // 4. Validar el formato del correo
      if (this.registroForm.get('correo')?.errors?.['email']) {
        this.abrirModal('El formato del correo electrónico no es válido.');
        return;
      }

      // Mensaje genérico si falta llenar algún campo obligatorio
      this.abrirModal('Por favor, completá todos los campos obligatorios para continuar.');
      return;
    }

    if (!this.archivoSeleccionado) {
      this.abrirModal('La imagen de perfil es obligatoria.'); 
      return;
    }

    // Encendemos el spinner
    this.cargando = true;

    this.authService.registrarUsuario(this.registroForm.value, this.archivoSeleccionado)
      .subscribe({
        next: () => {
          this.cargando = false; // Apagamos el spinner
          
          // Vaciamos todos los campos
          this.registroForm.reset();
          
          // Limpiamos la variable del archivo
          this.archivoSeleccionado = null;
          
          // Volvemos a ocultar las contraseñas si el usuario las dejó visibles
          this.mostrarContrasenia = false;
          this.mostrarRepetir = false;

          // Mostramos el modal de éxito (pasándole "true" para que sepa q tiene que redirigir)
          this.abrirModal('¡Usuario registrado con éxito! Ya podés iniciar sesión.', true);
        },
        error: (err) => {
          this.cargando = false; // Apagamos el spinner por fallo
          
          // Atajamos el Error 400 (error en RegisterDto)
          if (err.status === 400 && err.error.message) {
            const mensajesErrores = Array.isArray(err.error.message) 
              ? err.error.message.join(' | ') 
              : err.error.message;
            this.abrirModal('Datos inválidos: ' + mensajesErrores);
          } 
          // Atajamos el Error 409 (Duplicados en Mongo enviados por nuestro Backend)
          else if (err.status === 409) {
            // Ya no le concatenamos la palabra "Error: " porque el backend ya manda el texto limpio
            this.abrirModal(err.error.message);
          } 
          else {
            this.abrirModal('Ocurrió un error al registrar el usuario.');
          }
        }
      });
  }
}