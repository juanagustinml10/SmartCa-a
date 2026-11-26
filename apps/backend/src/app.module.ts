import { Module, ValidationPipe } from '@nestjs/common';
import { APP_PIPE, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { LoggerModule } from './logger/logger.module.js';
import { AuditModule } from './audit/audit.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CompanyModule } from './company/company.module.js';
import { UsersModule } from './users/users.module.js';
import { FarmModule } from './farm/farm.module.js';
import { SettingsModule } from './settings/settings.module.js';
import { FieldsModule } from './fields/fields.module.js';
import { CostsModule } from './costs/costs.module.js';
import { SuppliersModule } from './suppliers/suppliers.module.js';
import { CostCategoriesModule } from './cost-categories/cost-categories.module.js';
import { HarvestsModule } from './harvests/harvests.module.js';
import { PermissionsModule } from './permissions/permissions.module.js';
import { RolesModule } from './roles/roles.module.js';
import { SessionsModule } from './sessions/sessions.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { RolesGuard } from './common/guards/roles.guard.js';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
    PrismaModule,
    LoggerModule,
    AuditModule,
    AuthModule,
    CompanyModule,
    UsersModule,
    FarmModule,
    SettingsModule,
    FieldsModule,
    CostsModule,
    SuppliersModule,
    CostCategoriesModule,
    HarvestsModule,
    PermissionsModule,
    RolesModule,
    SessionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          whitelist: true,
          forbidNonWhitelisted: true,
          transform: true,
        }),
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
