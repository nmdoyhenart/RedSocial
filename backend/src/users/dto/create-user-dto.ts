import { IsString, IsNotEmpty, IsEmail, MinLength, Matches, IsDateString, MaxLength, IsOptional, IsEnum } from 'class-validator';
import { RolUsuario } from '../schemas/user.schema';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  apellido!: string;

  @IsEmail({}, { message: 'El correo debe tener un formato válido' })
  @IsNotEmpty()
  correo!: string;

  @IsString()
  @IsNotEmpty()
  nombreUsuario!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, {
    message: 'La contraseña debe tener al menos 8 caracteres',
  })
  @Matches(/(?=.*[A-Z])(?=.*\d)/, { message: 'La contraseña debe contener al menos una letra mayúscula y un número' })
  contrasenia!: string;

  @IsDateString()
  @IsNotEmpty()
  fechaNacimiento!: Date;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200, {
    message: 'La descripción no puede superar los 200 caracteres',
  })
  descripcion!: string;

  @IsOptional()
  @IsString()
  imagenPerfil?: string; // ? -> Opcional

  @IsOptional()
  @IsEnum(RolUsuario, { message: 'El perfil debe ser usuario o administrador' })
  perfil?: RolUsuario; // ? -> Opcional
}
