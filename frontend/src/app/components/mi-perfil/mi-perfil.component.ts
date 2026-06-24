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
    // Pedimos exactamente: 3 posts, desde el inicio (0), ordenados por fecha, de ESTE usuario
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
  
  // Por si eliminás un post directamente desde tu perfil
  removerPostDeLista(postId: string) {
    this.misPosts = this.misPosts.filter(p => p._id !== postId);
  }
}