import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ArchivosModule } from './archivos/archivos.module';

@Module({
  imports: [
    // Iniciamos el ConfigModule para que lea el archivo .env de forma global
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Conectar Mongoose inyectando ConfigService de forma segura
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI')!,
      }),
    }),

    UsersModule,
    AuthModule,
    ArchivosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
