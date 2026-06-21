import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostsService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-card.html',
  styleUrls: ['./post-card.css']
})
export class PostCardComponent {
  // Recibimos la información desde el componente padre
  @Input() post: any; 
  @Input() usuarioActual: any; 

  // Output para borrar el post si el padre lo elimina del back
  @Output() postEliminado = new EventEmitter<string>(); 

  constructor(private postsService: PostsService) {}

  get leDiLike(): boolean {
    if (!this.usuarioActual || !this.post.likes) return false;
    // Verificamos si el ID de nuestro usuario está en el array de likes
    return this.post.likes.includes(this.usuarioActual._id); 
  }

  toggleLike() {
    if (!this.usuarioActual) return;

    const userId = this.usuarioActual._id;
    const postId = this.post._id;

    if (this.leDiLike) {
      // Quitar like visualmente y luego persistir
      this.post.likes = this.post.likes.filter((id: string) => id !== userId);
      this.post.likesCount--;
      this.postsService.unlikePost(postId, userId).subscribe();
    } else {
      // Dar like
      this.post.likes.push(userId);
      this.post.likesCount++;
      this.postsService.likePost(postId, userId).subscribe();
    }
  }

  eliminarPost() {
    if (confirm('¿Estás seguro de eliminar tu post?')) {
      this.postsService.deletePost(this.post._id, this.usuarioActual._id).subscribe({
        next: () => {
          // Le avisamos al Padre que este ID ya no existe para que lo borre de la pantalla
          this.postEliminado.emit(this.post._id);
        },
        error: (err) => console.error('Error al borrar', err)
      });
    }
  }
}