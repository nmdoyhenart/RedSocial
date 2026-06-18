import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsNotEmpty({ message: 'El correo o nombre de usuario es obligatorio.' })
    @IsString()
    identificador!: string; // Le ponemos "identificador" porque puede ser el correo o nombreUsuario

    @IsNotEmpty({ message: 'La contraseña es obligatoria.' })
    @IsString()
    contrasenia!: string;
}