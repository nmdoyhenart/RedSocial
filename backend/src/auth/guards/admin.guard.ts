import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        // Tomamos la request donde el JWT ya guardó el payload
        const request = context.switchToHttp().getRequest();
        const user = request.user; 

        // Verificamos que el usuario exista y que su rol sea 'admin'
        if (user && user.perfil === 'administrador') {
        return true;
        }
        
        // Si no es admin, no lo dejamos pasar
        throw new ForbiddenException('Acceso restringido. Se requieren privilegios de administrador.');
    }
}