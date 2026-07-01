import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UsuariosService } from '../../services/usuarios.service';
import { ArrobaPipe } from '../../pipes/arroba-pipe';
import { ResaltarHoverDirective } from '../../directives/resaltar-hover.directive';
import { AutoFocusDirective } from '../../directives/auto-focus.directive';

@Component({
  selector: 'app-panel-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ArrobaPipe, ResaltarHoverDirective, AutoFocusDirective],
  templateUrl: './panel-admin.html',
  styleUrls: ['./panel-admin.css']
})
export class PanelAdminComponent implements OnInit {
  usuarios = signal<any[]>([]);

  // Control modal registro
  mostrarModal = signal<boolean>(false);
  registroForm: FormGroup;
  cargando = signal<boolean>(false);

  // Control para el modal de notificaciones (Éxito o Error)
  notificacion = signal<{ mostrar: boolean, mensaje: string, tipo: 'exito' | 'error' }>({
    mostrar: false, mensaje: '', tipo: 'exito'
  });

  constructor(
    private usuariosService: UsuariosService,
    private fb: FormBuilder
  ) {
    this.registroForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      nombreUsuario: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      contrasenia: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/) 
      ]],
      perfil: ['usuario', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (data: any[]) => {
        this.usuarios.set(data);
      },
      error: (err) => console.error('Error al cargar la base de datos:', err)
    });
  }

  alternarEstado(usuario: any): void {
    const estadoActual = usuario.activo === true;
    const nuevoEstado = !estadoActual;

    this.usuarios.update(users => 
      users.map(u => u._id === usuario._id ? { ...u, activo: nuevoEstado } : u)
    );

    const peticion = nuevoEstado 
      ? this.usuariosService.rehabilitarUsuario(usuario._id) 
      : this.usuariosService.deshabilitarUsuario(usuario._id);

    peticion.subscribe({
      next: () => console.log(`Estado sincronizado.`),
      error: (err) => {
        console.error('Fallo en el servidor...', err);
        this.usuarios.update(users => 
          users.map(u => u._id === usuario._id ? { ...u, activo: estadoActual } : u)
        );
      }
    });
  }

  abrirModal(): void {
    this.registroForm.reset({ perfil: 'usuario' }); 
    this.mostrarModal.set(true);
  }

  cerrarModal(): void {
    this.mostrarModal.set(false);
    this.registroForm.reset({ perfil: 'usuario' }); 
  }

  cerrarNotificacion(): void {
    this.notificacion.set({ mostrar: false, mensaje: '', tipo: 'exito' });
  }

  crearUsuarioAdmin(): void {
    // Si el formulario es inválido, avisa en vez de no hacer nada
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      this.notificacion.set({
        mostrar: true, 
        mensaje: 'DATOS INVÁLIDOS. Revisá que la contraseña tenga 8 caracteres, 1 mayúscula y 1 número.', 
        tipo: 'error'
      });
      return;
    }

    this.cargando.set(true);

    const datosUsuario = {
      ...this.registroForm.value,
      fechaNacimiento: new Date().toISOString(),
      descripcion: 'Cuenta generada por el sistema de administración.',
      imagenPerfil: `https://api.dicebear.com/7.x/bottts/svg?seed=${this.registroForm.value.nombreUsuario}`
    };

    this.usuariosService.crearUsuario(datosUsuario).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.cargarUsuarios(); // Refresca la tabla automáticamente
        this.cerrarModal(); // Cierra el formulario
        
        // DISPARA EL MODAL DE ÉXITO
        this.notificacion.set({
          mostrar: true, 
          mensaje: `SISTEMA: El usuario @${datosUsuario.nombreUsuario} fue creado y añadido a la red correctamente.`, 
          tipo: 'exito'
        });
      },
      error: (err) => {
        this.cargando.set(false);
        // DISPARA EL MODAL DE ERROR SI EL BACKEND LO RECHAZA (ej. correo duplicado)
        const mensajeBackend = err.error?.message || 'Error desconocido al contactar con la base de datos.';
        this.notificacion.set({
          mostrar: true, 
          mensaje: mensajeBackend, 
          tipo: 'error'
        });
      }
    });
  }
}