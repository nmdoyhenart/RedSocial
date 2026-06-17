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
      alert('La imagen de perfil es obligatoria');
      return;
    }

    this.authService.registrarUsuario(this.registroForm.value, this.archivoSeleccionado)
      .subscribe({
        next: () => {
          alert('¡Usuario registrado con éxito!');
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Error al registrar:', error);
          alert('Hubo un error en el registro. Revisá la consola.');
        }
      });
  }
}