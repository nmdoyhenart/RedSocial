import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user-dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Definimos las "vueltas" de encriptación (10 es el estándar de seguridad y rendimiento)
      const saltRounds = 10;

      // Encriptamos la contraseña que viene del DTO
      const contraseniaEncriptada = await bcrypt.hash(createUserDto.contrasenia, saltRounds);

      // Creamos un nuevo objeto copiando todo lo del DTO, pero pisando la contraseña
      const userData = {
        ...createUserDto,
        contrasenia: contraseniaEncriptada,
      };

      // Guardamos en la base de datos usando el nuevo objeto
      const newUser = new this.userModel(userData);
      return await newUser.save();
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error) {
        
        // Ampliamos el molde para que la propiedad 'keyPattern'
        // que Mongo envía cuando hay un dato duplicado
        const mongoError = error as { code: number; keyPattern?: Record<string, number> };
        
        if (mongoError.code === 11000 && mongoError.keyPattern) {
          if (mongoError.keyPattern.correo) {
            throw new ConflictException('Este correo electrónico ya está registrado.');
          }

          if (mongoError.keyPattern.nombreUsuario) {
            throw new ConflictException('Este nombre de usuario ya está en uso.');
          }
        }
      }

      throw error;
    }
  }

  // Busqueda ya sea por correo o nombreUsuario
  async buscarPorIdentificador(identificador: string) {
    return this.userModel.findOne({
      $or: [{ correo: identificador }, { nombreUsuario: identificador }],
    }).exec();
  }
}