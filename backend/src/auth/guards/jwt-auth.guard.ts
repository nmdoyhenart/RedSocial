import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        // Buscamos el token en la cabecera: "Authorization: Bearer <token>"
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        
        if (type !== 'Bearer' || !token) {
        throw new UnauthorizedException('Acceso denegado. No se proporcionó token.');
        }

        try {
        const payload = await this.jwtService.verifyAsync(token, {
            secret: this.configService.get<string>('JWT_SECRET'),
        });
        
        // Adjuntamos el payload descifrado (al objeto request) para que el controlador lo use
        request['user'] = payload;
        } catch {
        throw new UnauthorizedException('Token inválido o vencido.');
        }

        return true;
    }
}