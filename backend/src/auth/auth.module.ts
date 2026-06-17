import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { ArchivosModule } from '../archivos/archivos.module';

@Module({
  imports: [UsersModule, ArchivosModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}