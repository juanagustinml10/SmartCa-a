import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto.js';

export class UpdateRoleDto extends PartialType(
  OmitType(CreateRoleDto, ['permissionIds'] as const),
) {
  permissionIds?: string[];
}
