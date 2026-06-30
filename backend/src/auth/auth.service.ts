import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Document } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { ArchivosService } from '../archivos/archivos.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly archivosService: ArchivosService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    private async generarToken(usuario: any) {
        const payload = {
            sub: usuario._id, 
            correo: usuario.correo,
            nombreUsuario: usuario.nombreUsuario,
            perfil: usuario.perfil || 'usuario'
        };
        return {
            token: await this.jwtService.signAsync(payload)
        };
    }

    // Valida el token y devuelve los datos del usuario
    async autorizarToken(token: string) {
        try {
            const secret = this.configService.get<string>('JWT_SECRET'); // Leemos del .env
            const payload = await this.jwtService.verifyAsync(token, {
                secret: secret
            });
            return payload; 
        } catch {
            // Si falló (caducó o etc..), devolvemos el 401 exacto que pide el profe
            throw new UnauthorizedException('Token inválido o vencido');
        }
    }

    // Valida el token viejo y emite uno nuevo
    async refrescarToken(token: string) {
        try {
            const secret = this.configService.get<string>('JWT_SECRET'); // Leemos del .env
            const payload = await this.jwtService.verifyAsync(token, {
                secret: secret
            });
            
            // Le quitamos las fechas de expiración viejas (iat, exp) para firmarlo de cero
            const { iat, exp, ...datosLimpios } = payload;
            
            return {
                token: await this.jwtService.signAsync(datosLimpios)
            };
        } catch {
            throw new UnauthorizedException('Token inválido o vencido. Inicie sesión nuevamente.');
        }
    }

    async registro(registerDto: RegisterDto, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('La imagen de perfil es obligatoria.');
        }

        try {
            // Subir imagen a Cloudinary
            const imagenSubida = await this.archivosService.uploadImage(file);
            
            // Asignar la URL
            registerDto.imagenPerfil = imagenSubida.secure_url;

            // Guardar el usuario en bdd
            const nuevoUsuario = await this.usersService.create(registerDto);

            // Procesamos el objeto para generar el JWT
            const usuarioObjeto = (nuevoUsuario as any).toObject();

            // Extraemos la contraseña para no mandarla en el payload ni al frontend
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { contrasenia: contraseniaMongo, ...usuarioLimpio } = usuarioObjeto;

            // Generamos el token
            const { token } = await this.generarToken(usuarioLimpio);

            // Devolvemos la estructura espejada al login
            return {
                usuario: usuarioLimpio,
                token: token
            };

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

        const usuario = await this.usersService.buscarPorIdentificador(identificador);

        if (!usuario) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const contraseniaValida = await bcrypt.compare(contrasenia, usuario.contrasenia);

        if (!contraseniaValida) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const usuarioObjeto = usuario.toObject();
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { contrasenia: contraseniaMongo, ...usuarioLimpio } = usuarioObjeto;

        // Generamos y devolvemos el Token (junto con el usuario)
        const { token } = await this.generarToken(usuarioLimpio);

        return {
            usuario: usuarioLimpio,
            token: token // Devolvemos el token
        };
    }
}