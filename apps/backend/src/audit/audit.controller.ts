import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get()
  @Roles('admin', 'ingeniero')
  async findAll(
    @Query('search') search?: string,
    @Query('companyId') companyId?: string,
    @Query('action') action?: string,
    @Query('entity') entity?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const filters = {
      companyId: companyId ?? user?.companyId,
      action,
      entity,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    };

    if (filters.search) {
      const result = await this.service.search(filters);
      return { data: result.data, meta: result.meta };
    }

    const result = await this.service.findByFilters(filters);
    return { data: result.data, meta: result.meta };
  }
}
