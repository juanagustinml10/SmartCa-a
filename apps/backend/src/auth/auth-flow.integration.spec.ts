import 'dotenv/config';
import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module.js';
import { requireEnv } from '../common/config/required-env.js';

// Contraseña exclusiva de desarrollo, ya presente en prisma/seed.ts.
const DEMO_PASSWORD = 'SmartCañaDemo2026!';

const DEMO_USERS = [
  { email: 'admin@smartcana.com', role: 'admin' },
  { email: 'ingeniero@smartcana.com', role: 'ingeniero' },
  { email: 'operador@smartcana.com', role: 'operador' },
] as const;

interface DemoSession {
  accessToken: string;
  refreshToken: string;
  companyId: string;
}

describe('Autenticación real contra PostgreSQL (usuarios demo)', () => {
  let app: INestApplication;
  const sessions = new Map<string, DemoSession>();

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  function login(email: string, password: string) {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password });
  }

  it('los tres usuarios demo inician sesión, recuperan perfil y acceden a rutas protegidas', async () => {
    for (const demo of DEMO_USERS) {
      const res = await login(demo.email, DEMO_PASSWORD).expect(201);
      const body = res.body.data;

      expect(typeof body.accessToken).toBe('string');
      expect(typeof body.refreshToken).toBe('string');
      expect(body.user.email).toBe(demo.email);
      expect(body.user.role).toBe(demo.role);
      expect(body.user.companyName).toContain('SmartCaña');

      const profile = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${body.accessToken}`)
        .expect(200);
      expect(profile.body.data.email).toBe(demo.email);
      expect(profile.body.data.role.code).toBe(demo.role);
      expect(profile.body.data.company.id).toBe(body.user.companyId);

      await request(app.getHttpServer())
        .get('/fields')
        .set('Authorization', `Bearer ${body.accessToken}`)
        .expect(200);

      sessions.set(demo.role, {
        accessToken: body.accessToken,
        refreshToken: body.refreshToken,
        companyId: body.user.companyId,
      });
    }
  });

  it('las tres empresas recuperadas coinciden con la empresa demo del token', () => {
    const companyIds = new Set(
      [...sessions.values()].map((session) => session.companyId),
    );
    expect(companyIds.size).toBe(1);
  });

  it('admin puede consultar usuarios y operador/ingeniero reciben 403', async () => {
    const admin = sessions.get('admin');
    const operator = sessions.get('operador');
    const engineer = sessions.get('ingeniero');
    if (!admin || !operator || !engineer) throw new Error('Sesiones no inicializadas');

    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${admin.accessToken}`)
      .expect(200);

    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${operator.accessToken}`)
      .expect(403);

    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${engineer.accessToken}`)
      .expect(403);
  });

  it('rechaza contraseña incorrecta y usuario inexistente con el mismo mensaje', async () => {
    const wrongPassword = await login('admin@smartcana.com', 'ClaveIncorrecta!').expect(401);
    const unknownUser = await login('no-existe@smartcana.test', DEMO_PASSWORD).expect(401);

    expect(wrongPassword.body.message).toBe('Credenciales inválidas');
    expect(unknownUser.body.message).toBe('Credenciales inválidas');
  });

  it('rechaza tokens inválidos y vencidos', async () => {
    const jwt = new JwtService({ secret: requireEnv('JWT_SECRET') });
    const expired = jwt.sign(
      { sub: 'usuario-demo', sessionId: 'sesion-demo' },
      { expiresIn: '-1s' },
    );

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer token-invalido')
      .expect(401);

    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${expired}`)
      .expect(401);
  });

  it('recupera la sesión con refresh, rota los tokens e invalida los anteriores', async () => {
    for (const [role, session] of sessions) {
      const res = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: session.refreshToken })
        .expect(201);

      const renewed = res.body.data as { accessToken: string; refreshToken: string };
      expect(typeof renewed.accessToken).toBe('string');
      expect(typeof renewed.refreshToken).toBe('string');

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${renewed.accessToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .expect(401);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: session.refreshToken })
        .expect(401);

      sessions.set(role, { ...session, ...renewed });
    }
  });

  it('el cierre de sesión invalida el access token y el refresh token', async () => {
    for (const session of sessions.values()) {
      await request(app.getHttpServer())
        .post('/auth/logout')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .expect(201);

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${session.accessToken}`)
        .expect(401);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: session.refreshToken })
        .expect(401);
    }
  });
});
