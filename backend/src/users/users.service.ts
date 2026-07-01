import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
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

  // Listar todos los usuarios para el panel de administrador
  async findAll(): Promise<User[]> {
    try {
      // Proyectamos los campos necesarios para la tabla
      return await this.userModel
        .find({}, 'nombreUsuario nombre apellido perfil correo activo')
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Error al obtener el listado de usuarios');
    }
  }

  // Alta / Baja lógica (Deshabilitar / Rehabilitar)
  async cambiarEstado(id: string, estado: boolean): Promise<{ mensaje: string }> {
    try {
      await this.userModel.findByIdAndUpdate(id, { activo: estado }).exec();
      return { 
        mensaje: estado ? 'Usuario rehabilitado exitosamente.' : 'Usuario deshabilitado exitosamente.' 
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al actualizar el estado del usuario');
    }
  }

  // Métrica de usuarios activos vs inactivos para los gráficos del administrador
  async obtenerMetricasUsuarios() {
    try {
      const activos = await this.userModel.countDocuments({ activo: true }).exec();
      const inactivos = await this.userModel.countDocuments({ activo: false }).exec();
      
      return {
        activos,
        inactivos,
        total: activos + inactivos
      };
    } catch (error) {
      throw new InternalServerErrorException('Error al calcular estadísticas de usuarios');
    }
  }
}