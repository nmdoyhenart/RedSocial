/// <reference types="multer" />
import { Controller, Post, Body, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user-dto';
import { UsersService } from '../users/users.service';
import { ArchivosService } from '../archivos/archivos.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth') // localhost:3000/auth
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,      // Inyect service usuarios
        private readonly archivosService: ArchivosService, // Inyect service Cloudinary
    ) {}

    @Post('registro') // Endpoint final: localhost:3000/auth/registro
    @UseInterceptors(FileInterceptor('imagen'))
    async registro(
        @Body() createUserDto: CreateUserDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        // Validamos que venga la foto de perfil
        if (!file) {
        throw new BadRequestException('La imagen de perfil es obligatoria.');
        }

        // Subimos la imagen a Cloudinary
        const imagenSubida = await this.archivosService.uploadImage(file);

        // Le asignamos la URL segura de la nube al DTO
        createUserDto.imagenPerfil = imagenSubida.secure_url;

        // Guardamos el usuario en Mongo llamando al servicio de usuarios
        return this.usersService.create(createUserDto);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }
}