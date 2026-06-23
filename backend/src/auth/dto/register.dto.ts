import { IsString, IsNotEmpty, IsEmail, MinLength, Matches, IsOptional, registerDecorator, ValidationOptions} from 'class-validator';

export function IsOlderThan(age: number, validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
        name: 'isOlderThan',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: {
            validate(value: unknown) {
                if (!value || typeof value !== 'string') return false;
            
                const fechaNacimiento = new Date(value);
                const hoy = new Date();
                let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
                const mes = hoy.getMonth() - fechaNacimiento.getMonth();
            
                if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                    edad--;
                }
                return edad >= age;
            },
            
            defaultMessage() {
                return `Debes tener al menos ${age} años para registrarte.`;
            }
        },
        });
    };
}

export class RegisterDto {
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
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @Matches(/(?=.*[A-Z])(?=.*\d)/, { message: 'La contraseña debe contener al menos una letra mayúscula y un número' })
    contrasenia!: string;

    @IsString()
    @IsNotEmpty()
    @IsOlderThan(13)
    fechaNacimiento!: Date;

    @IsString()
    @IsNotEmpty()
    descripcion!: string;

    @IsOptional()
    @IsString()
    imagenPerfil?: string;
}