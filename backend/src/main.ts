import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Validaciones globales para nuestros DTOs
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);
}

// Se le agrega el .catch() para evitar el error de promesas flotantes
bootstrap().catch((err) => console.error(err));
