import 'reflect-metadata';
import { jest } from '@jest/globals';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import type { JwtPayload } from '@smartcana/types';

import { AuthController } from '../auth/auth.controller.js';
import { AuthService } from '../auth/auth.service.js';
import { JwtStrategy } from '../auth/strategies/jwt.strategy.js';
import { AuditService } from '../audit/audit.service.js';
import { CompanyController } from '../company/company.controller.js';
import { CompanyService } from '../company/company.service.js';
import { canAssignRole, isRoleAtLeast } from '../common/constants/roles.js';
import { requireEnv } from '../common/config/required-env.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { FieldsController } from '../fields/fields.controller.js';
import { FieldsRepository } from '../fields/fields.repository.js';
import { FieldsService } from '../fields/fields.service.js';
import { LoggerService } from '../logger/logger.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersController } from '../users/users.controller.js';
import { UsersService } from '../users/users.service.js';

const JWT_SECRET = 'test-access-secret-no-usar-en-produccion';
const REFRESH_SECRET = 'test-refresh-secret-no-usar-en-produccion';
const PASSWORD = 'Clave123!';

const FIELD_ID = '11111111-1111-4111-8111-111111111111';
const FARM_ID = '22222222-2222-4222-8222-222222222222';
const STATUS_ID = '33333333-3333-4333-8333-333333333333';

interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  status: string;
  deletedAt: Date | null;
  companyId: string;
  role: {
    id: string;
    code: string;
    name: string;
    rolePermissions: { permission: { code: string } }[];
  };
  company: { id: string; name: string };
}

function permissions(codes: string[]) {
  return codes.map((code) => ({ permission: { code } }));
}

describe('Seguridad, autenticación y aislamiento multi-tenant', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let usersById: Map<string, TestUser>;

  const prismaMock = {
    user: {
      findUnique: jest.fn<(...args: any[]) => any>(),
      update: jest.fn<(...args: any[]) => any>(),
    },
    session: { create: jest.fn<(...args: any[]) => any>() },
    auditLog: { create: jest.fn<(...args: any[]) => any>() },
    field: { findFirst: jest.fn<(...args: any[]) => any>() },
  };

  const fieldsServiceMock = {
    findAll: jest.fn<(...args: any[]) => any>(),
    findById: jest.fn<(...args: any[]) => any>(),
    create: jest.fn<(...args: any[]) => any>(),
    update: jest.fn<(...args: any[]) => any>(),
    remove: jest.fn<(...args: any[]) => any>(),
  };
  const usersServiceMock = {
    findAll: jest.fn<(...args: any[]) => any>(),
    findById: jest.fn<(...args: any[]) => any>(),
    create: jest.fn<(...args: any[]) => any>(),
    update: jest.fn<(...args: any[]) => any>(),
    remove: jest.fn<(...args: any[]) => any>(),
  };
  const companyServiceMock = {
    findAll: jest.fn<(...args: any[]) => any>(),
    findById: jest.fn<(...args: any[]) => any>(),
    create: jest.fn<(...args: any[]) => any>(),
    update: jest.fn<(...args: any[]) => any>(),
    remove: jest.fn<(...args: any[]) => any>(),
  };

  const meta = {
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };

  function tokenFor(
    userId: string,
    overrides: Partial<JwtPayload> = {},
    signing: { expiresIn?: JwtSignOptions['expiresIn'] } = {},
  ): string {
    const user = usersById.get(userId);
    if (!user) throw new Error(`Usuario de prueba no encontrado: ${userId}`);
    return jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role.code,
        companyId: user.companyId,
        ...overrides,
      },
      { expiresIn: signing.expiresIn ?? '2h' },
    );
  }

  beforeAll(async () => {
    process.env.JWT_SECRET = JWT_SECRET;
    process.env.JWT_REFRESH_SECRET = REFRESH_SECRET;

    const hash = await bcrypt.hash(PASSWORD, 10);
    usersById = new Map<string, TestUser>([
      [
        'user-admin',
        {
          id: 'user-admin',
          email: 'admin@company-a.test',
          firstName: 'Ana',
          lastName: 'Admin',
          passwordHash: hash,
          status: 'active',
          deletedAt: null,
          companyId: 'company-a',
          role: {
            id: 'role-admin',
            code: 'admin',
            name: 'Administrador',
            rolePermissions: permissions([
              'users.view',
              'users.create',
              'fields.view',
              'fields.create',
              'companies.view',
              'companies.manage',
            ]),
          },
          company: { id: 'company-a', name: 'Empresa A' },
        },
      ],
      [
        'user-operator',
        {
          id: 'user-operator',
          email: 'operador@company-a.test',
          firstName: 'Oscar',
          lastName: 'Operador',
          passwordHash: hash,
          status: 'active',
          deletedAt: null,
          companyId: 'company-a',
          role: {
            id: 'role-operador',
            code: 'operador',
            name: 'Operador',
            rolePermissions: permissions(['fields.view']),
          },
          company: { id: 'company-a', name: 'Empresa A' },
        },
      ],
      [
        'user-super',
        {
          id: 'user-super',
          email: 'super@company-a.test',
          firstName: 'Sofia',
          lastName: 'Super',
          passwordHash: hash,
          status: 'active',
          deletedAt: null,
          companyId: 'company-a',
          role: {
            id: 'role-super',
            code: 'super_admin',
            name: 'Super administrador',
            rolePermissions: permissions(['users.view', 'companies.manage']),
          },
          company: { id: 'company-a', name: 'Empresa A' },
        },
      ],
      [
        'user-no-perm',
        {
          id: 'user-no-perm',
          email: 'sinpermisos@company-a.test',
          firstName: 'Nora',
          lastName: 'SinPermisos',
          passwordHash: hash,
          status: 'active',
          deletedAt: null,
          companyId: 'company-a',
          role: {
            id: 'role-admin-2',
            code: 'admin',
            name: 'Administrador',
            rolePermissions: permissions(['fields.view']),
          },
          company: { id: 'company-a', name: 'Empresa A' },
        },
      ],
      [
        'user-inactive',
        {
          id: 'user-inactive',
          email: 'inactivo@company-a.test',
          firstName: 'Ines',
          lastName: 'Inactiva',
          passwordHash: hash,
          status: 'inactive',
          deletedAt: null,
          companyId: 'company-a',
          role: {
            id: 'role-inactivo',
            code: 'admin',
            name: 'Administrador',
            rolePermissions: permissions(['fields.view']),
          },
          company: { id: 'company-a', name: 'Empresa A' },
        },
      ],
    ]);

    jwtService = new JwtService({ secret: JWT_SECRET });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuthController, FieldsController, UsersController, CompanyController],
      providers: [
        AuthService,
        JwtStrategy,
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prismaMock },
        { provide: AuditService, useValue: { log: jest.fn<(...args: any[]) => any>().mockResolvedValue(undefined) } },
        {
          provide: LoggerService,
          useValue: {
            info: jest.fn<(...args: any[]) => any>(),
            warn: jest.fn<(...args: any[]) => any>(),
            error: jest.fn<(...args: any[]) => any>(),
            debug: jest.fn<(...args: any[]) => any>(),
          },
        },
        { provide: FieldsService, useValue: fieldsServiceMock },
        { provide: UsersService, useValue: usersServiceMock },
        { provide: CompanyService, useValue: companyServiceMock },
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
        { provide: APP_GUARD, useClass: PermissionsGuard },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    prismaMock.user.findUnique.mockImplementation(
      async ({ where }: { where: { id?: string; email?: string } }) => {
        if (where.email) {
          return [...usersById.values()].find((u) => u.email === where.email) ?? null;
        }
        return usersById.get(where.id ?? '') ?? null;
      },
    );
    prismaMock.user.update.mockResolvedValue({});
    prismaMock.session.create.mockResolvedValue({});
    prismaMock.field.findFirst.mockResolvedValue(null);

    fieldsServiceMock.findAll.mockResolvedValue({ data: [], meta });
    fieldsServiceMock.findById.mockResolvedValue({ id: FIELD_ID, name: 'Campo A' });
    fieldsServiceMock.create.mockImplementation(
      async (companyId: string, dto: Record<string, unknown>) => ({
        id: FIELD_ID,
        ...dto,
        companyId,
      }),
    );
    usersServiceMock.findAll.mockResolvedValue({ data: [], meta });
    companyServiceMock.create.mockImplementation(async (dto: Record<string, unknown>) => ({
      id: FIELD_ID,
      ...dto,
    }));
  });

  describe('POST /auth/login', () => {
    it('acepta credenciales válidas y devuelve tokens reales', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@company-a.test', password: PASSWORD })
        .expect(201);

      expect(typeof res.body.data.accessToken).toBe('string');
      expect(typeof res.body.data.refreshToken).toBe('string');
      expect(res.body.data.user.companyId).toBe('company-a');
      expect(prismaMock.session.create).toHaveBeenCalledTimes(1);
    });

    it('rechaza contraseña incorrecta con 401', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@company-a.test', password: 'ClaveErronea!' })
        .expect(401);

      expect(res.body.message).toContain('Credenciales inválidas');
      expect(prismaMock.session.create).not.toHaveBeenCalled();
    });

    it('rechaza contraseña más corta que 6 caracteres con 400', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@company-a.test', password: '12345' })
        .expect(400);
    });
  });

  describe('protección JWT', () => {
    it('devuelve 401 sin token', async () => {
      await request(app.getHttpServer()).get('/fields').expect(401);
    });

    it('devuelve 401 con token vencido', async () => {
      const token = tokenFor('user-admin', {}, { expiresIn: '-1s' });
      await request(app.getHttpServer())
        .get('/fields')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('devuelve 401 si el usuario fue desactivado después de emitir el token', async () => {
      const token = tokenFor('user-inactive');
      await request(app.getHttpServer())
        .get('/fields')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    });

    it('rehidrata la empresa desde la BD, no desde el payload del token', async () => {
      // El token afirma company-b, pero la BD dice company-a.
      const token = tokenFor('user-admin', { companyId: 'company-b' });
      await request(app.getHttpServer())
        .get('/fields')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(fieldsServiceMock.findAll).toHaveBeenCalledWith(
        'company-a',
        expect.any(Object),
      );
    });
  });

  describe('roles y permisos', () => {
    it('un operador no puede consultar usuarios', async () => {
      const token = tokenFor('user-operator');
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('un admin sin users.view recibe 403 aunque su rol sea suficiente', async () => {
      const token = tokenFor('user-no-perm');
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });

    it('un super_admin satisface @Roles(admin) y ve usuarios', async () => {
      const token = tokenFor('user-super');
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('un admin no puede crear empresas aunque tenga companies.manage', async () => {
      const token = tokenFor('user-admin');
      await request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Empresa Nueva' })
        .expect(403);
      expect(companyServiceMock.create).not.toHaveBeenCalled();
    });

    it('un super_admin sí puede crear empresas', async () => {
      const token = tokenFor('user-super');
      await request(app.getHttpServer())
        .post('/companies')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Empresa Nueva' })
        .expect(201);
      expect(companyServiceMock.create).toHaveBeenCalledTimes(1);
    });

    it('la jerarquía de roles impide asignar roles superiores', () => {
      expect(isRoleAtLeast('super_admin', 'admin')).toBe(true);
      expect(isRoleAtLeast('operador', 'admin')).toBe(false);
      expect(canAssignRole('admin', 'super_admin')).toBe(false);
      expect(canAssignRole('admin', 'operador')).toBe(true);
    });
  });

  describe('aislamiento multi-tenant y manipulación de companyId', () => {
    it('ignora ?companyId= en la query y usa el del token', async () => {
      const token = tokenFor('user-admin');
      await request(app.getHttpServer())
        .get(`/fields/${FIELD_ID}?companyId=company-b`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(fieldsServiceMock.findById).toHaveBeenCalledWith('company-a', FIELD_ID);
      expect(fieldsServiceMock.findById).not.toHaveBeenCalledWith(
        'company-b',
        FIELD_ID,
      );
    });

    it('rechaza companyId en la query de listado por no estar declarado en el DTO', async () => {
      const token = tokenFor('user-admin');
      await request(app.getHttpServer())
        .get('/fields?companyId=company-b')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });

    it('rechaza companyId en el body y fuerza el del token al crear', async () => {
      const token = tokenFor('user-admin');
      const body = {
        farmId: FARM_ID,
        fieldStatusId: STATUS_ID,
        name: 'Campo Nuevo',
        areaHectares: 12.5,
        companyId: 'company-b',
      };

      await request(app.getHttpServer())
        .post('/fields')
        .set('Authorization', `Bearer ${token}`)
        .send(body)
        .expect(400);

      const { companyId: _ignored, ...validBody } = body;
      await request(app.getHttpServer())
        .post('/fields')
        .set('Authorization', `Bearer ${token}`)
        .send(validBody)
        .expect(201);

      expect(fieldsServiceMock.create).toHaveBeenCalledWith(
        'company-a',
        expect.objectContaining({ name: 'Campo Nuevo' }),
      );
    });

    it('el repositorio filtra campos por la empresa del establecimiento', async () => {
      const repository = new FieldsRepository(prismaMock as unknown as PrismaService);
      await repository.findById('company-a', FIELD_ID);

      expect(prismaMock.field.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: FIELD_ID,
            farm: { companyId: 'company-a', deletedAt: null },
          }),
        }),
      );
    });
  });

  describe('secretos obligatorios', () => {
    it('requireEnv rechaza marcadores CAMBIARME sin imprimir el valor', () => {
      process.env.SMARTCANA_TEST_SECRET = 'CAMBIARME';
      expect(() => requireEnv('SMARTCANA_TEST_SECRET')).toThrow(
        'Variable de entorno obligatoria no configurada: SMARTCANA_TEST_SECRET',
      );
      delete process.env.SMARTCANA_TEST_SECRET;
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
