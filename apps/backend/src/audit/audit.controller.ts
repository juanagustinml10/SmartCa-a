import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { QueryAuditDto } from './dto/query-audit.dto.js';
import type { JwtPayload } from '@smartcana/types';

@Controller('audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get()
  @Roles('admin')
  @Permissions('audit.view')
  async findAll(@Query() query: QueryAuditDto, @CurrentUser() user: JwtPayload) {
    const filters = {
      companyId: user.companyId,
      action: query.action,
      entity: query.entity,
      dateFrom: query.dateFrom ? new Date(query.dateFrom) : undefined,
      dateTo: query.dateTo ? new Date(query.dateTo) : undefined,
      search: query.search,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    };

    if (filters.search) {
      const result = await this.service.search(filters);
      return { data: result.data, meta: result.meta };
    }

    const result = await this.service.findByFilters(filters);
    return { data: result.data, meta: result.meta };
  }
}
