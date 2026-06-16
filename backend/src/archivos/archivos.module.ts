import { Module } from '@nestjs/common';
import { ArchivosService } from './archivos.service';
import { ArchivosController } from './archivos.controller';
import { CloudinaryProvider } from './cloudinary.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule], // Importamos al ConfigModule para leer el .env en el provider
  controllers: [ArchivosController],
  providers: [ArchivosService, CloudinaryProvider],
  exports: [ArchivosService], // Lo exportamos para usarlo desde UsersModule
})

export class ArchivosModule {}