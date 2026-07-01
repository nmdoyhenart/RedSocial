import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserSchema } from './schemas/user.schema';
import { ArchivosModule } from '../archivos/archivos.module';

@Module({
  imports: [
    // Registra el modelo en este módulo
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ArchivosModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
