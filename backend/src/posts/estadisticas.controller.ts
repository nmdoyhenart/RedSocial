import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CommentsService } from './comments/comments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UsersService } from '../users/users.service';

@Controller('estadisticas')
@UseGuards(JwtAuthGuard, AdminGuard)
export class EstadisticasController {
    constructor(
        private readonly postsService: PostsService,
        private readonly usersService: UsersService,
        private readonly commentsService: CommentsService,
    ) {}

    // GET: /estadisticas/posts (Cantidad de posts por día)
    @Get('posts')
        async obtenerEstadisticasPosts(
            @Query('desde') desde?: string,
            @Query('hasta') hasta?: string,
        ) {
            return this.postsService.obtenerPostsPorUsuario(desde, hasta);
    }

    // GET: /estadisticas/usuarios (Usuarios activos vs inactivos)
    @Get('usuarios')
    async obtenerEstadisticasUsuarios() {
        return this.usersService.obtenerMetricasUsuarios();
    }

    // GET: /estadisticas/comentarios (Cantidad de comentarios por usuario)
    @Get('comentarios')
    async obtenerEstadisticasComentarios(
        @Query('desde') desde?: string,
        @Query('hasta') hasta?: string,
    ) {
        return this.commentsService.obtenerComentariosPorUsuario(desde, hasta);
    }

    // GET: /estadisticas/comentarios-por-publicacion (Cantidad de comentarios por cada post)
    @Get('comentarios-por-publicacion')
    async obtenerEstadisticasComentariosPorPublicacion(
        @Query('desde') desde?: string,
        @Query('hasta') hasta?: string,
    ) {
        return this.commentsService.obtenerComentariosPorPublicacion(desde, hasta);
    }
}