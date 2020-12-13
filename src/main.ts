import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AuthExceptionFilter } from './common/auth-exception.filter';
import { SwaggerTags } from './swagger/tags';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalFilters(new AuthExceptionFilter());
  app.enableCors({ origin: ['http://localhost:3000'], credentials: true });
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
