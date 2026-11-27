// El seed, las pruebas y el arranque dev deben leer el mismo .env local.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  app.setGlobalPrefix('api', { exclude: ['health'] });

  app.useGlobalFilters(new HttpExceptionFilter(), new PrismaExceptionFilter());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`SmartCaña API running on http://localhost:${port}`);
}
void bootstrap();
