import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service.js';
import { DashboardQueryDto } from './dto/dashboard-query.dto.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  /**
   * Un único pedido devuelve todos los datos del Dashboard. El ámbito es la
   * empresa del token: cualquier `companyId` enviado por el cliente se ignora.
   */
  @Get()
  @Permissions('dashboard.view')
  async overview(
    @Query() query: DashboardQueryDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return { data: await this.service.getOverview(user.companyId, query) };
  }
}
