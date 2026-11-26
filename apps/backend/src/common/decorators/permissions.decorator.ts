import { SetMetadata } from '@nestjs/common';
import type { PermissionCode } from '@smartcana/types';

export const PERMISSIONS_KEY = 'permissions';

/** Requiere uno de los permisos indicados. Sólo se evalúa si el endpoint lo declara. */
export const Permissions = (...permissions: PermissionCode[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
