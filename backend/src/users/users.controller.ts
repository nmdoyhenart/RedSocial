// src/users/users.controller.ts
import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('usuarios')
@UseGuards(JwtAuthGuard, AdminGuard) // PROTECCIÓN DOBLE: Debe estar logueado Y ser admin
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET: Listado de usuarios
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // POST: Alta de nuevo usuario
  @Post()
  create(@Body() createUserDto: any) {
    return this.usersService.create(createUserDto);
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