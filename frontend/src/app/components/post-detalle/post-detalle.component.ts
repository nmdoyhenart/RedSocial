import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges, OnChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommentsService } from '../../services/comments.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-post-detalle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-detalle.html',
  styleUrls: ['./post-detalle.css']
})
export class PostDetalleComponent implements OnInit, OnChanges {
  // Recibimos el post completo desde la tarjeta
  @Input() post: any; 
  // Creamos un emisor para avisar que queremos cerrar el modal
  @Output() cerrarModal = new EventEmitter<void>();

  comentarios: any[] = [];
  comentariosVisibles: any[] = [];
  nuevoComentario: string = '';
  limit = 5;
  offset = 0;
  hayMasComentarios = true;
  cargandoComentarios = false;
  limiteVisible = 5;

  usuarioActualId: string = '';
  comentarioEnEdicionId: string | null = null;
  textoEdicion: string = '';

  // Variable para mostrar modal de validación
  mostrarModalNoAuth = false;

  constructor(
    private commentsService: CommentsService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const usuario = this.authService.getUsuarioActual();
    if (usuario) {
      this.usuarioActualId = usuario._id;
    }
    // Aseguramos la carga inicial si el post ya está disponible
    if (this.post && this.post._id) {
      this.cargarComentarios();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['post'] && changes['post'].currentValue) {
      console.log('¡Data recibida correctamente en el modal!', this.post);
      this.cargarComentarios();
    }
  }

  // Actualiza la referencia del arreglo HTML
  actualizarVisibles() {
    this.comentariosVisibles = this.comentarios.slice(0, this.limiteVisible);
    this.cdr.detectChanges(); // Forzamos el redibujado de la interfaz
  }

  cargarComentarios() {
    if (!this.post || !this.post._id || this.cargandoComentarios) return; 

    this.cargandoComentarios = true;

    this.commentsService.obtenerComentarios(this.post._id, this.limit, this.offset)
    .subscribe({
      next: (res) => {
        if (res && res.comentarios) {
          this.comentarios = [...this.comentarios, ...res.comentarios];
          if (this.comentarios.length >= res.total) {
            this.hayMasComentarios = false;
          }

          // Obligamos a revisar la vista actualizando el arreglo visible
          this.actualizarVisibles(); 
        }
        this.cargandoComentarios = false;
      },
      error: (err) => {
        console.error('Error cargando comentarios:', err);
        this.cargandoComentarios = false;
      }
    });
  }

  leerMas() {
    this.limiteVisible += 5;
    this.actualizarVisibles(); // Actualizamos la vista con el nuevo límite

    if (this.limiteVisible > this.comentarios.length && this.hayMasComentarios) {
      this.offset += this.limit;
      this.cargarComentarios();
    }
  }

  verMenos() {
    this.limiteVisible = 5;
    this.actualizarVisibles();
  }

  enviarComentario() {
    if (!this.usuarioActualId) {
      this.mostrarModalNoAuth = true;
      return;
    }

    // Si está logueado, el flujo sigue normal
    if (!this.nuevoComentario.trim()) return;
    this.commentsService.agregarComentario(this.post._id, this.nuevoComentario).subscribe({
      next: (comentarioGuardado) => {
        this.comentarios.unshift(comentarioGuardado);
        this.nuevoComentario = '';
        
        this.limiteVisible++;
        this.actualizarVisibles();
      }
    });
  }

  redirigirAuth(ruta: string) {
    this.cerrar(); // Primero cerramos el modal de la publicación
    this.router.navigate([ruta]); // Y luego lo mandamos a la ruta elegida
  }

  iniciarEdicion(com: any) {
    this.comentarioEnEdicionId = com._id; this.textoEdicion = com.mensaje; 
  }
  
  cancelarEdicion() {
    this.comentarioEnEdicionId = null; this.textoEdicion = ''; 
  }
  
  guardarEdicion(comId: string) {
    if (!this.textoEdicion.trim()) return;
    this.commentsService.modificarComentario(comId, this.textoEdicion).subscribe({
      next: (comActualizado) => {
        const index = this.comentarios.findIndex(c => c._id === comId);
        if (index !== -1) {
          this.comentarios[index] = comActualizado;
          this.actualizarVisibles();
        }
        this.cancelarEdicion();
      }
    });
  }

  cerrar() {
    this.cerrarModal.emit();
  }
}