import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import * as Sentry from '@sentry/node';

import { AppModule } from './app.module';
import { AuthExceptionFilter } from './common/auth-exception.filter';
import { SwaggerTags } from './swagger/tags';
import { SentryInterceptor } from './common/sentry.interceptor';

export const SENTRY_DSN =
  'https://6680786eddd54f95b49173c1cb19b1e0@o493460.ingest.sentry.io/5562437';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalFilters(new AuthExceptionFilter());
  app.enableCors({ origin: ['http://localhost:3000'], credentials: true });
  app.useGlobalInterceptors(new SentryInterceptor());
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

  Sentry.init({
    dsn: SENTRY_DSN,
  });

  await app.listen(4500);
}
bootstrap();
