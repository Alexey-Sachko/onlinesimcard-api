import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: ['http://localhost:3000'] });
  const options = new DocumentBuilder()
    .setTitle('Onlinesimcard.ru API')
    .setDescription('Описание Rest api для onlinesimcard.ru')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // app.setGlobalPrefix('v1');

  await app.listen(4500);
}
bootstrap();
