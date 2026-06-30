import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PostsService } from '../../services/publicaciones.service';
import { PostCardComponent } from '../post-card/post-card.component';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, RouterLink, PostCardComponent],
  templateUrl: './mi-perfil.html',
  styleUrls: ['./mi-perfil.css']
})
export class MiPerfilComponent implements OnInit {
  usuario: any = null;
  misPosts: any[] = [];

  // Variables para la edición de foto
  archivoSeleccionado: File | null = null;
  imagenVistaPrevia: string | ArrayBuffer | null = null;

  constructor(
    private authService: AuthService,
    private postsService: PostsService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.authService.usuarioActual$.subscribe(user => {
      this.usuario = user;
      
      if (this.usuario) {
        this.cargarMisUltimosPosts();
      }
      this.cdr.detectChanges();
    });
  }

  cargarMisUltimosPosts() {
    this.postsService.getPosts(3, 0, 'fecha', this.usuario._id).subscribe({
      next: (res: any) => {
        const arrayPosts = res.posts ? res.posts : res;
        this.misPosts = [...arrayPosts];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error al cargar mis posts:', err)
    });
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
  
  removerPostDeLista(postId: string) {
    this.misPosts = this.misPosts.filter(p => p._id !== postId);
  }

  // MÉTODO PARA MANEJAR LA NUEVA FOTO DE PERFIL
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (file) {
      this.archivoSeleccionado = file;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenVistaPrevia = e.target?.result as string;
        // Forzamos la actualización de la vista para que la imagen aparezca de inmediato
        this.cdr.detectChanges();
      };
      
      reader.readAsDataURL(file);
    }
  }
}