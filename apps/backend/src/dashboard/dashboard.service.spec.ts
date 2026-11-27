import { BadRequestException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { DashboardService } from './dashboard.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

function makePrisma(overrides: Record<string, unknown> = {}) {
  const campaign = {
    id: 'campaña-1',
    code: '2025/2026',
    name: 'Campaña 2025/2026',
    startDate: new Date('2025-07-01T00:00:00.000Z'),
    endDate: null,
    isActive: true,
  };

  const prisma = {
    campaign: {
      findMany: jest.fn(async () => [campaign]),
    },
    farm: {
      count: jest.fn(async () => 2),
    },
    field: {
      findMany: jest.fn(async () => [
        {
          id: 'campo-1',
          name: 'Lote Norte',
          areaHectares: { toString: () => '10' },
          campaignCode: '2025/2026',
          estimatedProduction: { toString: () => '100' },
          healthScore: 80,
          shiScore: 80,
          shiLevel: 'bueno',
          color: '#1DB85E',
          fieldStatus: { code: 'active', name: 'En producción' },
          farm: { name: 'Establecimiento Demo' },
        },
        {
          id: 'campo-2',
          name: 'Lote Sur',
          areaHectares: { toString: () => '20' },
          campaignCode: '2025/2026',
          estimatedProduction: { toString: () => '200' },
          healthScore: 90,
          shiScore: 90,
          shiLevel: 'excelente',
          color: '#1DB85E',
          fieldStatus: { code: 'harvesting', name: 'En cosecha' },
          farm: { name: 'Establecimiento Demo' },
        },
      ]),
    },
    activity: {
      findMany: jest.fn(async () => [
        {
          id: 'act-1',
          title: 'Fertilización',
          activityDate: new Date('2026-07-20T00:00:00.000Z'),
          observations: 'Aplicación realizada',
          productName: null,
          activityType: { code: 'fertilization' },
          field: { name: 'Lote Norte' },
        },
      ]),
      count: jest.fn(async () => 0).mockResolvedValueOnce(5).mockResolvedValueOnce(3),
    },
    cost: {
      findMany: jest.fn(async () => [
        {
          amount: { toString: () => '100' },
          costDate: new Date('2026-06-01T00:00:00.000Z'),
          costCategory: { id: 'cat-1', name: 'Labores', color: '#10B981' },
        },
        {
          amount: { toString: () => '200' },
          costDate: new Date('2026-06-15T00:00:00.000Z'),
          costCategory: { id: 'cat-1', name: 'Labores', color: '#10B981' },
        },
        {
          amount: { toString: () => '300' },
          costDate: new Date('2026-07-01T00:00:00.000Z'),
          costCategory: { id: 'cat-2', name: 'Insumos', color: '#3B82F6' },
        },
      ]),
      aggregate: jest.fn(async () => ({ _sum: { amount: { toString: () => '400' } } })),
    },
    harvest: {
      findMany: jest.fn(async () => [
        {
          tons: { toString: () => '100' },
          tonsPerHectare: { toString: () => '10' },
          field: { areaHectares: { toString: () => '10' } },
          campaign: { id: 'campaña-1', code: '2025/2026', name: 'Campaña 2025/2026' },
        },
        {
          tons: { toString: () => '200' },
          tonsPerHectare: { toString: () => '20' },
          field: { areaHectares: { toString: () => '20' } },
          campaign: { id: 'campaña-1', code: '2025/2026', name: 'Campaña 2025/2026' },
        },
      ]),
      aggregate: jest.fn(async () => ({ _sum: { tons: { toString: () => '200' } } })),
    },
    fieldAlert: {
      findMany: jest.fn(async () => [
        {
          id: 'alerta-1',
          title: 'Sequía',
          type: 'warning',
          priority: 'high',
          createdAt: new Date('2026-07-25T00:00:00.000Z'),
          field: { name: 'Lote Sur' },
        },
        {
          id: 'alerta-2',
          title: 'Revisión',
          type: 'info',
          priority: 'low',
          createdAt: new Date('2026-07-24T00:00:00.000Z'),
          field: null,
        },
      ]),
      count: jest.fn(async () => 0).mockResolvedValueOnce(2).mockResolvedValueOnce(4),
    },
    fieldStatus: {
      findMany: jest.fn(async () => [
        { code: 'active', name: 'En producción' },
        { code: 'harvesting', name: 'En cosecha' },
        { code: 'resting', name: 'En descanso' },
      ]),
    },
    ...overrides,
  };
  return prisma;
}

function serviceWith(prisma: ReturnType<typeof makePrisma>): DashboardService {
  return new DashboardService(prisma as unknown as PrismaService);
}

describe('DashboardService', () => {
  it('calcula los indicadores desde las filas devueltas por PostgreSQL', async () => {
    const prisma = makePrisma();
    const service = serviceWith(prisma);

    const result = await service.getOverview('empresa-a', {});

    expect(result.metrics).toEqual({
      farms: 2,
      fields: 2,
      areaHectares: 30,
      activities: 5,
      costsTotal: 600,
      harvests: 2,
      productionTons: 300,
      activeAlerts: 2,
      averageShi: 85,
      costPerHectare: 20,
    });
    expect(result.fieldStatus).toEqual([
      { code: 'active', name: 'En producción', count: 1, areaHectares: 10 },
      { code: 'harvesting', name: 'En cosecha', count: 1, areaHectares: 20 },
      { code: 'resting', name: 'En descanso', count: 0, areaHectares: 0 },
    ]);
    expect(result.costByCategory).toEqual([
      { id: 'cat-1', name: 'Labores', color: '#10B981', total: 300 },
      { id: 'cat-2', name: 'Insumos', color: '#3B82F6', total: 300 },
    ]);
    expect(result.costByMonth).toEqual([
      { month: '2026-06', total: 300 },
      { month: '2026-07', total: 300 },
    ]);
    expect(result.productionByCampaign).toEqual([
      {
        campaignCode: '2025/2026',
        campaignName: 'Campaña 2025/2026',
        production: 300,
        yieldPerHectare: 16.67,
        target: 300,
      },
    ]);
    expect(result.activities[0]).toMatchObject({
      title: 'Fertilización',
      field: 'Lote Norte',
      type: 'fertilization',
    });
    expect(result.alerts[0]).toMatchObject({ priority: 'high', field: 'Lote Sur' });
    expect(result.trends.activities).toBeNull();
  });

  it('aplica filtros temporales y de campaña en todas las consultas', async () => {
    const prisma = makePrisma();
    const service = serviceWith(prisma);

    await service.getOverview('empresa-a', {
      campaignId: 'campaña-1',
      from: '2026-01-01',
      to: '2026-12-31',
    });

    const farmWhere = (prisma.farm.count as ReturnType<typeof jest.fn>).mock.calls[0][0].where;
    expect(farmWhere).toMatchObject({ companyId: 'empresa-a', deletedAt: null });

    const fieldWhere = (prisma.field.findMany as ReturnType<typeof jest.fn>).mock.calls[0][0].where;
    expect(fieldWhere).toMatchObject({ campaignCode: '2025/2026' });
    expect(fieldWhere.farm).toMatchObject({ companyId: 'empresa-a' });

    const activityWhere = (prisma.activity.count as ReturnType<typeof jest.fn>).mock.calls[0][0].where;
    expect(activityWhere).toMatchObject({ campaignId: 'campaña-1' });
    expect(activityWhere.activityDate).toEqual({
      gte: new Date('2026-01-01T00:00:00.000Z'),
      lte: new Date('2026-12-31T23:59:59.999Z'),
    });

    const costWhere = (prisma.cost.findMany as ReturnType<typeof jest.fn>).mock.calls[0][0].where;
    expect(costWhere).toMatchObject({ companyId: 'empresa-a', campaignId: 'campaña-1' });
    expect(costWhere.costDate.lte).toEqual(new Date('2026-12-31T23:59:59.999Z'));

    const harvestWhere = (prisma.harvest.findMany as ReturnType<typeof jest.fn>).mock.calls[0][0].where;
    expect(harvestWhere).toMatchObject({ companyId: 'empresa-a', campaignId: 'campaña-1' });
    expect(harvestWhere.startDate.gte).toEqual(new Date('2026-01-01T00:00:00.000Z'));

    const alertWhere = (prisma.fieldAlert.findMany as ReturnType<typeof jest.fn>).mock.calls[0][0].where;
    expect(alertWhere.createdAt.lte).toEqual(new Date('2026-12-31T23:59:59.999Z'));
  });

  it('calcula la variación contra el período anterior equivalente', async () => {
    const prisma = makePrisma();
    const service = serviceWith(prisma);

    const result = await service.getOverview('empresa-a', {
      from: '2026-01-01',
      to: '2026-12-31',
    });

    expect(result.trends).toEqual({
      activities: { previous: 3, percent: 66.7 },
      costsTotal: { previous: 400, percent: 50 },
      productionTons: { previous: 200, percent: 50 },
      activeAlerts: { previous: 2, percent: 0 },
    });
    expect(result.filters.from).toBe('2026-01-01T00:00:00.000Z');
    expect(result.filters.to).toBe('2026-12-31T23:59:59.999Z');
  });

  it('devuelve ceros y listas vacías cuando no hay registros', async () => {
    const prisma = makePrisma({
      farm: { count: jest.fn(async () => 0) },
      field: { findMany: jest.fn(async () => []) },
      activity: { findMany: jest.fn(async () => []), count: jest.fn(async () => 0) },
      cost: { findMany: jest.fn(async () => []), aggregate: jest.fn(async () => ({ _sum: { amount: null } })) },
      harvest: { findMany: jest.fn(async () => []), aggregate: jest.fn(async () => ({ _sum: { tons: null } })) },
      fieldAlert: { findMany: jest.fn(async () => []), count: jest.fn(async () => 0) },
      fieldStatus: { findMany: jest.fn(async () => []) },
    });
    const service = serviceWith(prisma);

    const result = await service.getOverview('empresa-a', {});

    expect(result.metrics).toMatchObject({
      farms: 0,
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
    expect(result.fieldStatus).toEqual([]);
    expect(result.costByCategory).toEqual([]);
    expect(result.costByMonth).toEqual([]);
    expect(result.productionByCampaign).toEqual([]);
    expect(result.alerts).toEqual([]);
    expect(result.activities).toEqual([]);
    expect(result.fields).toEqual([]);
  });

  it('nunca usa el companyId del cliente y aplica la empresa del token en cada consulta', async () => {
    const prisma = makePrisma();
    const service = serviceWith(prisma);

    const result = await service.getOverview('empresa-a', {
      // Un cliente malicioso agrega este campo; el servicio lo ignora.
      ...({ companyId: 'empresa-b' } as object),
    });

    const allWheres = [
      (prisma.farm.count as ReturnType<typeof jest.fn>).mock.calls[0][0],
      (prisma.field.findMany as ReturnType<typeof jest.fn>).mock.calls[0][0].where,
      (prisma.activity.findMany as ReturnType<typeof jest.fn>).mock.calls[0][0].where,
      (prisma.cost.findMany as ReturnType<typeof jest.fn>).mock.calls[0][0].where,
      (prisma.harvest.findMany as ReturnType<typeof jest.fn>).mock.calls[0][0].where,
      (prisma.fieldAlert.findMany as ReturnType<typeof jest.fn>).mock.calls[0][0].where,
    ];
    for (const where of allWheres) {
      expect(JSON.stringify(where)).toContain('empresa-a');
      expect(JSON.stringify(where)).not.toContain('empresa-b');
    }
    expect(result.filters.campaignId).toBeNull();
  });

  it('rechaza una campaña que no pertenece al catálogo visible', async () => {
    const service = serviceWith(makePrisma());
    await expect(
      service.getOverview('empresa-a', { campaignId: '00000000-0000-4000-8000-999999999999' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rechaza un rango de fechas invertido', async () => {
    const service = serviceWith(makePrisma());
    await expect(
      service.getOverview('empresa-a', { from: '2026-12-31', to: '2026-01-01' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('propaga los errores de conexión con PostgreSQL', async () => {
    const prisma = makePrisma({
      farm: { count: jest.fn(async () => { throw new Error('sin conexión con PostgreSQL'); }) },
    });
    const service = serviceWith(prisma);

    await expect(service.getOverview('empresa-a', {})).rejects.toThrow(
      'sin conexión con PostgreSQL',
    );
  });
});
