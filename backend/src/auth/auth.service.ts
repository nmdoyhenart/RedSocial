import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { ArchivosService } from '../archivos/archivos.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly archivosService: ArchivosService
    ) {}

    async registro(registerDto: RegisterDto, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('La imagen de perfil es obligatoria.');
        }

        try {
            // Subir imagen a Cloudinary
            const imagenSubida = await this.archivosService.uploadImage(file);
            
            // Asignar la URL
            registerDto.imagenPerfil = imagenSubida.secure_url;

            // Guardamos el usuario en Mongo
            return await this.usersService.create(registerDto);

        } catch (error: unknown) {
            const mongoError = error as { code?: number, keyPattern?: Record<string, number> };

            if (mongoError && mongoError.code === 11000 && mongoError.keyPattern) {
                // Si el duplicado fue en el correo
                if (mongoError.keyPattern.correo) {
                    throw new ConflictException('Este correo electrónico ya está registrado.');
                }
                // Si el duplicado fue en el nombre de usuario
                if (mongoError.keyPattern.nombreUsuario) {
                    throw new ConflictException('Este nombre de usuario ya está en uso.');
                }
            }
            throw error; 
        }
    }

    async login(loginDto: LoginDto) {
        const { identificador, contrasenia } = loginDto;

        // Busqueda del usuario en la base de datos
        const usuario = await this.usersService.buscarPorIdentificador(identificador);

        // Si el usuario no existe, rechazamos el acceso
        if (!usuario) {
        throw new UnauthorizedException('Credenciales inválidas');
        }

        // Comparamos la contraseña
        const contraseniaValida = await bcrypt.compare(contrasenia, usuario.contrasenia);

        if (!contraseniaValida) {
        throw new UnauthorizedException('Credenciales inválidas');
        }

        const usuarioObjeto = usuario.toObject();

        // Extraemos 'contrasenia' pero la renombramos como 'contraseniaMongo' para que no se sobreescriba
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { contrasenia: contraseniaMongo, ...usuarioLimpio } = usuarioObjeto;

        // Devolvemos el usuario limpio sin contraseña
        return usuarioLimpio;
    }
}