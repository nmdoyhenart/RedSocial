import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {}

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

        // Convertimos a un objeto y separamos la contraseña del resto de los datos
        const { contrasenia: _, ...usuarioLimpio } = usuario.toObject();

        // Devolvemos el usuario limpio sin contraseña
        return usuarioLimpio;
    }
}