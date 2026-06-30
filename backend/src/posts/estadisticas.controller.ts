import { Controller, Get, UseGuards } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { UsersService } from '../users/users.service';

@Controller('estadisticas')
@UseGuards(JwtAuthGuard, AdminGuard)
export class EstadisticasController {
    constructor(private readonly postsService: PostsService, private readonly usersService: UsersService) {}

    // GET: /estadisticas/posts (Cantidad de posts por día)
    @Get('posts')
    async obtenerEstadisticasPosts() {
        return this.postsService.obtenerMetricasPosts();
    }

    // GET: /estadisticas/usuarios (Usuarios activos vs inactivos)
    @Get('usuarios')
    async obtenerEstadisticasUsuarios() {
        return this.usersService.obtenerMetricasUsuarios();
    }
}