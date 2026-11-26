import type { RoleCode } from '@smartcana/types';

/**
 * Jerarquía de roles del sistema. Un número menor significa más privilegios.
 * Se usa tanto para la autorización por jerarquía como para impedir que un
 * usuario asigne roles superiores al suyo.
 */
export const ROLE_RANK: Record<RoleCode, number> = {
  super_admin: 0,
  admin: 1,
  gerente: 2,
  supervisor: 3,
  ingeniero: 3,
  operador: 4,
  invitado: 5,
};

function rankOf(role: string | undefined): number | null {
  if (!role) return null;
  const rank = ROLE_RANK[role as RoleCode];
  return rank === undefined ? null : rank;
}

/** El rol del usuario es el indicado o tiene un nivel superior. */
export function isRoleAtLeast(role: string | undefined, required: RoleCode): boolean {
  const current = rankOf(role);
  const minimum = rankOf(required);
  if (current === null || minimum === null) return false;
  return current <= minimum;
}

/** Un usuario sólo puede asignar roles de su mismo nivel o inferior. */
export function canAssignRole(actorRole: string | undefined, targetRole: string | undefined): boolean {
  const current = rankOf(actorRole);
  const target = rankOf(targetRole);
  if (current === null || target === null) return false;
  return current <= target;
}
