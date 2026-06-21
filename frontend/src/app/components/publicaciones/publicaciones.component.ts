import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PostsService } from '../../services/publicaciones.service';
import { PostCardComponent } from '../post-card/post-card.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, PostCardComponent],
  templateUrl: './publicaciones.html',
  styleUrls: ['./publicaciones.css']
})
export class PublicacionesComponent implements OnInit {
  usuarioActual: any = null;
  publicaciones: any[] = [];
  
  // Variables de Paginación y Ordenamiento
  limit = 5;
  offset = 0;
  orderBy = 'fecha'; // Ordenado por fecha
  totalPosts = 0;

  // Variables para el formulario de creación
  nuevoTitulo: string = '';
  nuevaDescripcion: string = '';
  archivoSeleccionado: File | null = null;
  creandoPost: boolean = false;

  // Manejo modal
  mostrarModal: boolean = false;
  mensajeModal: string = '';

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Nos suscribimos para escuchar en tiempo real si hay usuario o no
    this.authService.usuarioActual$.subscribe(user => {
      this.usuarioActual = user;
      this.cdr.detectChanges();
    });

    // Cargamos sin importar si está logueado o no
    this.cargarPublicaciones();
  }

  abrirModal(mensaje: string) {
    this.mensajeModal = mensaje;
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  cargarPublicaciones() {
    this.postsService.getPosts(this.limit, this.offset, this.orderBy).subscribe({
      next: (res) => {
        // Extraemos el array
        const arrayPosts = res.posts ? res.posts : res;
        this.publicaciones = [...arrayPosts]; 
        this.totalPosts = res.total ? res.total : this.publicaciones.length;

        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar posts:', err)
    });
  }

  // Atrapa el archivo cuando el usuario elige una imagen
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.archivoSeleccionado = file;
    }
  }

  crearPublicacion() {
    if (!this.nuevoTitulo || !this.nuevaDescripcion || !this.usuarioActual) {
      this.abrirModal('El título y la descripción son obligatorios');
      return;
    }

    this.creandoPost = true;

    // Armamos el FormData
    const formData = new FormData();
    formData.append('title', this.nuevoTitulo);
    formData.append('description', this.nuevaDescripcion);
    formData.append('user', this.usuarioActual._id);
    
    // El backend espera que el archivo se llame 'imagen'
    if (this.archivoSeleccionado) {
      formData.append('imagen', this.archivoSeleccionado);
    }

    // Llamamos al servicio
    this.postsService.createPost(formData).subscribe({
      next: (nuevoPost) => {
        nuevoPost.user = this.usuarioActual;

        // unshift() mete el post al PRINCIPIO del array, mostrándolo inmediatamente en pantalla
        this.publicaciones.unshift(nuevoPost);

        // Limpiamos el formulario
        this.nuevoTitulo = '';
        this.nuevaDescripcion = '';
        this.archivoSeleccionado = null;
        this.creandoPost = false;
      },
      error: (err) => {
        console.error('Error al crear post:', err);
        this.creandoPost = false;
      }
    });
  }

  cambiarOrden(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.orderBy = selectElement.value; // Captura 'fecha' o 'likes'
    
    // Al cambiar el orden, volvemos a la primera página para evitar desfases
    this.offset = 0; 
    
    // Volvemos a pedirle los datos frescos al backend
    this.cargarPublicaciones(); 
  }

  removerPostDeLista(postId: string) {
    this.publicaciones = this.publicaciones.filter(p => p._id !== postId);
  }
}