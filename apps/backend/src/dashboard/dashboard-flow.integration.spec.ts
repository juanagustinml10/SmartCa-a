import 'dotenv/config';
import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';

import { AppModule } from '../app.module.js';

// Contraseña exclusiva de desarrollo, ya presente en prisma/seed.ts.
const DEMO_PASSWORD = 'SmartCañaDemo2026!';

describe('Dashboard con datos reales de PostgreSQL', () => {
  let app: INestApplication;
  let token: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@smartcana.com', password: DEMO_PASSWORD })
      .expect(201);
    token = login.body.data.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  function overview(query = '') {
    return request(app.getHttpServer())
      .get(`/dashboard${query}`)
      .set('Authorization', `Bearer ${token}`);
  }

  it('muestra los indicadores calculados desde la base demo', async () => {
    const res = await overview().expect(200);
    const data = res.body.data;

    expect(data.metrics).toMatchObject({
      farms: 1,
      fields: 3,
      areaHectares: 35.8,
      activities: 6,
      costsTotal: 200000,
      harvests: 3,
      productionTons: 2509,
      activeAlerts: 3,
      averageShi: 82,
      costPerHectare: 5586.59,
    });
    expect(data.campaigns.length).toBeGreaterThan(0);
    expect(data.fields).toHaveLength(3);
    expect(data.activities).toHaveLength(6);
    expect(data.costByCategory.length).toBeGreaterThan(0);
    expect(data.costByMonth.length).toBeGreaterThan(0);
    expect(data.productionByCampaign.length).toBeGreaterThan(0);
    expect(data.fieldStatus.some((item: { count: number }) => item.count > 0)).toBe(true);
  });

  it('rechaza un companyId enviado por el cliente (whitelist)', async () => {
    await overview().expect(200);
    const spoofed = await overview(
      '?companyId=00000000-0000-4000-8000-999999999999',
    ).expect(400);

    expect(spoofed.body.data).toBeUndefined();
  });

  it('filtra por campaña y muestra series vacías cuando no hay registros', async () => {
    const initial = await overview().expect(200);
    const oldCampaign = initial.body.data.campaigns.find(
      (campaign: { code: string }) => campaign.code === '2024/2025',
    );
    expect(oldCampaign).toBeDefined();

    const res = await overview(`?campaignId=${oldCampaign.id}`).expect(200);
    const data = res.body.data;

    expect(data.filters.campaignId).toBe(oldCampaign.id);
    expect(data.metrics).toMatchObject({
      fields: 0,
      areaHectares: 0,
      activities: 0,
      costsTotal: 0,
      harvests: 0,
      productionTons: 0,
      activeAlerts: 0,
      averageShi: null,
      costPerHectare: null,
    });
    expect(data.activities).toEqual([]);
    expect(data.alerts).toEqual([]);
    expect(data.costByCategory).toEqual([]);
    expect(data.productionByCampaign).toEqual([]);
  });

  it('acepta un rango temporal explícito', async () => {
    const res = await overview('?from=2026-07-01&to=2026-07-31').expect(200);
    const data = res.body.data;

    expect(data.filters.from).toBe('2026-07-01T00:00:00.000Z');
    expect(data.filters.to).toBe('2026-07-31T23:59:59.999Z');
    expect(data.metrics.costsTotal).toBeGreaterThanOrEqual(0);
    expect(data.metrics.productionTons).toBeGreaterThanOrEqual(0);
  });

  it('rechaza parámetros inválidos y un token sin sesión', async () => {
    await overview('?from=no-es-una-fecha').expect(400);
    await overview('?campaignId=no-es-un-uuid').expect(400);

    await request(app.getHttpServer())
      .get('/dashboard')
      .set('Authorization', 'Bearer token-invalido')
      .expect(401);
  });
});
