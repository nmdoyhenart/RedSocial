import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum RolUsuario {
  USUARIO = 'usuario',
  ADMINISTRADOR = 'administrador',
}

// Generamos el tipo de documento correcto sin extender la clase
export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  nombre!: string; // Agregamos "!" para evitar el error de inicialización estricta

  @Prop({ required: true })
  apellido!: string;

  @Prop({ required: true, unique: true })
  correo!: string;

  @Prop({ required: true, unique: true })
  nombreUsuario!: string;

  @Prop({ required: true })
  contrasenia!: string;

  @Prop({ required: true })
  fechaNacimiento!: Date;

  @Prop({ required: true, maxlength: 200 })
  descripcion!: string;

  @Prop({ required: true })
  imagenPerfil!: string;

  @Prop({ type: String, enum: RolUsuario, default: RolUsuario.USUARIO })
  perfil!: RolUsuario;
}

export const UserSchema = SchemaFactory.createForClass(User);
