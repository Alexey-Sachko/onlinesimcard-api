import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SwaggerTags } from './swagger/tags';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: ['http://localhost:3000'] });
  app.setGlobalPrefix('api/v1');
  const options = new DocumentBuilder()
    .setTitle('Onlinesimcard.ru API')
    .setDescription('Описание Rest api для onlinesimcard.ru')
    .setVersion('1.0')
    .addBearerAuth();

  Object.values(SwaggerTags).forEach(tag => {
    options.addTag(tag);
  });

  const buildedOptions = options.build();
  const document = SwaggerModule.createDocument(app, buildedOptions);
  SwaggerModule.setup('api/v1', app, document);

  await app.listen(4500);
}
bootstrap();
