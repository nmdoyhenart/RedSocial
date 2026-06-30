/// <reference types="multer" />
import { Controller, Post, Body, UseInterceptors, UploadedFile, UnauthorizedException, HttpStatus, HttpCode } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { ArchivosService } from '../archivos/archivos.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth') // localhost:3000/auth
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
        private readonly archivosService: ArchivosService, 
    ) {}

    @Post('registro')
    @UseInterceptors(FileInterceptor('imagen'))
    async registro(
        @Body() registerDto: RegisterDto, // Usamos el RegisterDto
        @UploadedFile() file: Express.Multer.File,
    ) {
        // El controlador solo le pasa los datos al servicio
        return this.authService.registro(registerDto, file);
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('autorizar')
    @HttpCode(HttpStatus.OK)
    async autorizar(@Body('token') token: string) {
        if (!token) {
        throw new UnauthorizedException('No se proporcionó ningún token');
        }
        return this.authService.autorizarToken(token);
    }

    @Post('refrescar')
    @HttpCode(HttpStatus.OK)
    async refrescar(@Body('token') token: string) {
        if (!token) {
        throw new UnauthorizedException('No se proporcionó ningún token');
        }
        return this.authService.refrescarToken(token);
    }
}