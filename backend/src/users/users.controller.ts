/// <reference types="multer" />
import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user-dto';
import { ArchivosService } from '../archivos/archivos.service';

@Controller('users') // localhost:3000/users
export class UsersController {
  // Inyectamos el servicio de usuarios y sumamos el de archivos
  constructor(
    private readonly usersService: UsersService,
    private readonly archivosService: ArchivosService
  ) {}

  @Post('registro') // Define endpoint final: localhost:3000/users/registro
  @UseInterceptors(FileInterceptor('imagen')) // Ataja el archivo físico que viene en la petición
  async registro(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // 1. Verificamos que el usuario haya mandado una foto
    if (!file) {
      throw new BadRequestException('La imagen de perfil es obligatoria.');
    }

    // 2. Subimos el archivo a la nube a través de nuestro servicio
    const imagenSubida = await this.archivosService.uploadImage(file);

    // 3. Le asignamos la URL que nos devolvió Cloudinary directamente al DTO
    createUserDto.imagenPerfil = imagenSubida.secure_url;

    // 4. Se lo mandamos al servicio usando su tipo original y sin usar "any"
    return this.usersService.create(createUserDto);
  }
}