import { PartialType, OmitType } from '@nestjs/mapped-types';
import { ArrayNotEmpty, IsArray, IsOptional, IsUUID } from 'class-validator';
import { CreateRoleDto } from './create-role.dto.js';

export class UpdateRoleDto extends PartialType(
  OmitType(CreateRoleDto, ['permissionIds'] as const),
) {
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  permissionIds?: string[];
}
