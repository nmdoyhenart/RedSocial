// src/users/users.controller.ts
import { Controller, Get, Post, Delete, Param, Body, UseGuards, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('usuarios')
@UseGuards(JwtAuthGuard) // PROTECCIÓN DOBLE: Debe estar logueado Y ser admin
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET: Listado de usuarios
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // POST: Alta de nuevo usuario
  @Post()
  async create(@Body() createUserDto: any) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error: any) {
      // Atrapamos el error de duplicado
      if (error.code === 11000 && error.keyPattern) {
        if (error.keyPattern.correo) {
          throw new ConflictException('Este correo de red ya se encuentra registrado.');
        }
        if (error.keyPattern.nombreUsuario) {
          throw new ConflictException('El identificador (nombre de usuario) ya está en uso.');
        }
      }
      // Si es otro error, lanzamos un 500 pero más descriptivo
      throw new InternalServerErrorException('Error crítico al intentar guardar en la base de datos.');
    }
  }

  // DELETE: Baja lógica (Deshabilitar)
  @Delete(':id')
  deshabilitar(@Param('id') id: string) {
    return this.usersService.cambiarEstado(id, false); 
  }

  // POST: Alta lógica (Rehabilitar)
  @Post(':id/alta')
  habilitar(@Param('id') id: string) {
    return this.usersService.cambiarEstado(id, true);
  }
}