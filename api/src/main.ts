import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './filters/prisma-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: ['http://localhost:4200', 'http://192.168.17.196:4200'],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove campos que não estão no DTO
      forbidNonWhitelisted: true, // Dá erro se enviar campos a mais
      transform: true, // Transforma tipos automaticamente (string '1' virar number 1)
    }),
  );

  // 2. Habilita o filtro de erros do Prisma Globalmente
  app.useGlobalFilters(new PrismaClientExceptionFilter());
  const config = new DocumentBuilder()
    .setTitle('Dashify API')
    .setDescription('API para utilização do sistema e-Quali')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  // 1. Habilita validação automática (DTOs)
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
