import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppController } from '../src/app.controller.js';
import { AppService } from '../src/app.service.js';

/**
 * E2E mínimo y sin base de datos: verifica el arranque HTTP y el endpoint de
 * salud. No importa AppModule para no requerir secretos ni conexión real.
 * Las pruebas de autenticación/tenancy están en `src/security/*.spec.ts`.
 */
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', async () => {
    const res = await request(app.getHttpServer()).get('/health').expect(200);
    expect(res.body).toMatchObject({
      status: 'ok',
      name: 'SmartCaña API',
      version: '0.1.0',
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
