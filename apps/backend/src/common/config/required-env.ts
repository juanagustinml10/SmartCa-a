/**
 * Lectura de variables de entorno obligatorias.
 *
 * El backend no debe arrancar con secretos inventados ni con los marcadores
 * de una plantilla `.env.example`. No imprime valores: sólo el nombre de la
 * variable faltante.
 */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (
    !value ||
    value.trim() === '' ||
    value.trim().toUpperCase() === 'CAMBIARME'
  ) {
    throw new Error(
      `Variable de entorno obligatoria no configurada: ${name}`,
    );
  }
  return value;
}
