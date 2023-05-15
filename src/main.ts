import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { AuthenticatedSocketAdapter } from './events/auth-socket.adapter';
import * as admin from 'firebase-admin/app';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  app.useWebSocketAdapter(new AuthenticatedSocketAdapter(app));

  const config = new DocumentBuilder()
    .setTitle('Quiz Brawl')
    .setDescription('QB API docs')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  admin.initializeApp({
    projectId: configService.get('FIREBASE_PROJECT_ID'),
    credential: admin.applicationDefault(),
  });

  app.enableCors();
  await app.listen(3000);
}
bootstrap();
