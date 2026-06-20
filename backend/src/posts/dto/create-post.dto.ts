import { IsString, IsNotEmpty, IsOptional, MaxLength, IsMongoId } from 'class-validator';

export class CreatePostDto {
    @IsString({ message: 'El título debe ser un texto válido' })
    @IsNotEmpty({ message: 'El título es obligatorio' })
    @MaxLength(100, { message: 'El título no puede tener más de 100 caracteres' })
    title!: string;

    @IsString({ message: 'La descripción debe ser un texto válido' })
    @IsNotEmpty({ message: 'La descripción es obligatoria' })
    description!: string;

    @IsOptional()
    @IsString({ message: 'La URL de la imagen debe ser un texto válido' })
    imageUrl?: string;

    // Agregamos el ID del usuario que viene desde el front
    @IsMongoId({ message: 'El ID del usuario no es válido' })
    @IsNotEmpty({ message: 'El usuario es obligatorio' })
    user!: string; 
}