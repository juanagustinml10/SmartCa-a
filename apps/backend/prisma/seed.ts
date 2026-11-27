import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

// Seed de DESARROLLO. Ejecutar solo sobre una base creada desde prisma/migrations.
// Nunca ejecutar contra una base de producción: crea usuarios con contraseña demo.

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || databaseUrl === "CAMBIARME") {
  throw new Error(
    "DATABASE_URL no configurada. Copiar apps/backend/.env.example a apps/backend/.env y completar antes de ejecutar el seed.",
  );
}

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

// UUID v4 deterministas: 00000000-0000-4000-8000-<grupo><indice>.
// El grupo identifica la entidad y el indice la fila, para que reruns no dupliquen.
function uuid(group: number, index: number): string {
  return `00000000-0000-4000-8000-${group.toString(16).padStart(2, "0")}${index.toString(16).padStart(10, "0")}`;
}

const GROUPS = {
  tenant: 0x01,
  permission: 0x02,
  role: 0x03,
  user: 0x04,
  fieldStatus: 0x05,
  variety: 0x06,
  campaign: 0x07,
  activityType: 0x08,
  costCategory: 0x09,
  supplier: 0x0a,
  field: 0x0b,
  activity: 0x0c,
  cost: 0x0d,
  harvest: 0x0e,
  alert: 0x0f,
  setting: 0x10,
  rolePermission: 0x11,
} as const;

// Contraseña exclusiva de desarrollo. No es un secreto de producción.
const DEMO_PASSWORD = "SmartCañaDemo2026!";
const DEMO_CUIT = "30-12345678-9";

// ── Permisos (coinciden con PermissionCode de @smartcana/types) ──
const permissionDefs: { code: string; name: string; module: string }[] = [
  { code: "dashboard.view", name: "Ver Dashboard", module: "dashboard" },
  { code: "fields.view", name: "Ver Campos", module: "fields" },
  { code: "fields.create", name: "Crear Campos", module: "fields" },
  { code: "fields.edit", name: "Editar Campos", module: "fields" },
  { code: "fields.delete", name: "Eliminar Campos", module: "fields" },
  { code: "activities.view", name: "Ver Actividades", module: "activities" },
  { code: "activities.create", name: "Crear Actividades", module: "activities" },
  { code: "activities.edit", name: "Editar Actividades", module: "activities" },
  { code: "activities.delete", name: "Eliminar Actividades", module: "activities" },
  { code: "production.view", name: "Ver Producción", module: "production" },
  { code: "production.edit", name: "Editar Producción", module: "production" },
  { code: "costs.view", name: "Ver Costos", module: "costs" },
  { code: "costs.create", name: "Crear Costos", module: "costs" },
  { code: "costs.edit", name: "Editar Costos", module: "costs" },
  { code: "costs.delete", name: "Eliminar Costos", module: "costs" },
  { code: "costs.export", name: "Exportar Costos", module: "costs" },
  { code: "harvests.view", name: "Ver Cosechas", module: "harvests" },
  { code: "harvests.create", name: "Crear Cosechas", module: "harvests" },
  { code: "harvests.edit", name: "Editar Cosechas", module: "harvests" },
  { code: "shi.view", name: "Ver SHI", module: "shi" },
  { code: "ia.use", name: "Usar IA", module: "ia" },
  { code: "reports.view", name: "Ver Reportes", module: "reports" },
  { code: "reports.export", name: "Exportar Reportes", module: "reports" },
  { code: "executive.view", name: "Vista Ejecutiva", module: "executive" },
  { code: "map.view", name: "Ver Mapa", module: "map" },
  { code: "users.view", name: "Ver Usuarios", module: "users" },
  { code: "users.create", name: "Crear Usuarios", module: "users" },
  { code: "users.edit", name: "Editar Usuarios", module: "users" },
  { code: "users.delete", name: "Eliminar Usuarios", module: "users" },
  { code: "roles.view", name: "Ver Roles", module: "roles" },
  { code: "roles.manage", name: "Gestionar Roles", module: "roles" },
  { code: "permissions.manage", name: "Gestionar Permisos", module: "permissions" },
  { code: "companies.view", name: "Ver Empresas", module: "companies" },
  { code: "companies.manage", name: "Gestionar Empresas", module: "companies" },
  { code: "sessions.view", name: "Ver Sesiones", module: "sessions" },
  { code: "sessions.revoke", name: "Revocar Sesiones", module: "sessions" },
  { code: "audit.view", name: "Ver Auditoría", module: "audit" },
  { code: "audit.export", name: "Exportar Auditoría", module: "audit" },
  { code: "settings.view", name: "Ver Configuración", module: "settings" },
  { code: "settings.manage", name: "Gestionar Configuración", module: "settings" },
  { code: "suppliers.view", name: "Ver Proveedores", module: "suppliers" },
  { code: "suppliers.create", name: "Crear Proveedores", module: "suppliers" },
  { code: "suppliers.edit", name: "Editar Proveedores", module: "suppliers" },
  { code: "suppliers.delete", name: "Eliminar Proveedores", module: "suppliers" },
];

const ALL_CODES = permissionDefs.map((p) => p.code);

// ── Roles: el catalogo incluye super_admin, pero ningun usuario demo lo usa ──
const roleDefs: {
  code: string;
  name: string;
  description: string;
  isSystem: boolean;
  permissions: string[];
}[] = [
  {
    code: "super_admin",
    name: "Super Administrador",
    description: "Acceso total al sistema (catalogo; sin usuarios demo asignados)",
    isSystem: true,
    permissions: ALL_CODES,
  },
  {
    code: "admin",
    name: "Administrador",
    description: "Administrador de la empresa",
    isSystem: false,
    permissions: ALL_CODES.filter((c) => c !== "permissions.manage" && c !== "companies.manage"),
  },
  {
    code: "gerente",
    name: "Gerente",
    description: "Gerente de la empresa",
    isSystem: false,
    permissions: ALL_CODES.filter(
      (c) =>
        !c.startsWith("users.") &&
        !c.startsWith("roles.") &&
        !c.startsWith("permissions.") &&
        !c.startsWith("companies.") &&
        !c.startsWith("sessions.") &&
        !c.startsWith("audit.") &&
        c !== "settings.manage",
    ),
  },
  {
    code: "supervisor",
    name: "Supervisor",
    description: "Supervisor de campo",
    isSystem: false,
    permissions: [
      "dashboard.view",
      "fields.view",
      "activities.view",
      "activities.create",
      "activities.edit",
      "activities.delete",
      "production.view",
      "costs.view",
      "harvests.view",
      "shi.view",
      "ia.use",
      "reports.view",
      "map.view",
      "suppliers.view",
    ],
  },
  {
    code: "ingeniero",
    name: "Ingeniero Agrónomo",
    description: "Ingeniero agrónomo",
    isSystem: false,
    permissions: [
      "dashboard.view",
      "fields.view",
      "activities.view",
      "activities.create",
      "activities.edit",
      "activities.delete",
      "production.view",
      "production.edit",
      "costs.view",
      "costs.create",
      "costs.edit",
      "harvests.view",
      "shi.view",
      "ia.use",
      "reports.view",
      "map.view",
      "suppliers.view",
    ],
  },
  {
    code: "operador",
    name: "Operador",
    description: "Operador de campo",
    isSystem: false,
    permissions: [
      "dashboard.view",
      "fields.view",
      "activities.view",
      "activities.create",
      "production.view",
      "costs.view",
      "harvests.view",
      "shi.view",
      "map.view",
    ],
  },
  {
    code: "invitado",
    name: "Invitado",
    description: "Solo lectura limitada",
    isSystem: false,
    permissions: ["dashboard.view", "fields.view", "activities.view", "shi.view", "map.view"],
  },
];

async function seed() {
  console.log("🌱 Seeding SmartCaña (desarrollo) ...");

  // ── Permisos globales ──
  const permissionRows = permissionDefs.map((p, i) => ({
    id: uuid(GROUPS.permission, i + 1),
    ...p,
  }));
  await prisma.permission.createMany({ data: permissionRows, skipDuplicates: true });
  const storedPermissions = await prisma.permission.findMany({
    where: { code: { in: permissionDefs.map((p) => p.code) } },
  });
  const permissionIdByCode = new Map(storedPermissions.map((p) => [p.code, p.id]));
  console.log(`  ✓ ${permissionIdByCode.size} permisos`);

  // ── Catálogos globales ──
  const statusDefs = [
    { code: "active", name: "En producción" },
    { code: "harvesting", name: "En cosecha" },
    { code: "resting", name: "En descanso" },
    { code: "inactive", name: "Inactivo" },
  ];
  const statusRows = await Promise.all(
    statusDefs.map((s, i) =>
      prisma.fieldStatus.upsert({
        where: { id: uuid(GROUPS.fieldStatus, i + 1) },
        update: {},
        create: { id: uuid(GROUPS.fieldStatus, i + 1), ...s },
      }),
    ),
  );
  const statusIdByCode = new Map(statusRows.map((s) => [s.code, s.id]));

  const varietyDefs = [
    {
      code: "LCP 85-384",
      name: "LCP 85-384",
      origin: "INTA/EEA Tucumán",
      cycle: "Medio",
      potentialYieldMin: "60.00",
      potentialYieldMax: "85.00",
      diseaseTolerance: "Resistente a roya",
      pestTolerance: "Tolerante a barrenador",
      waterRequirement: "Medio",
      soilPreference: "Franco arcilloso",
    },
    {
      code: "TUCCP 77-42",
      name: "TUCCP 77-42",
      origin: "INTA/EEA Tucumán",
      cycle: "Precoz",
      potentialYieldMin: "55.00",
      potentialYieldMax: "80.00",
      diseaseTolerance: "Moderadamente resistente",
      pestTolerance: "Moderada",
      waterRequirement: "Bajo-Medio",
      soilPreference: "Franco arenoso",
    },
    {
      code: "RA 87-3",
      name: "RA 87-3",
      origin: "INTA/EEA Tucumán",
      cycle: "Tardío",
      potentialYieldMin: "50.00",
      potentialYieldMax: "75.00",
      diseaseTolerance: "Resistente a carbón",
      pestTolerance: "Tolerante",
      waterRequirement: "Medio-Alto",
      soilPreference: "Franco",
    },
  ];
  const varietyRows = await Promise.all(
    varietyDefs.map((v, i) =>
      prisma.variety.upsert({
        where: { id: uuid(GROUPS.variety, i + 1) },
        update: {},
        create: { id: uuid(GROUPS.variety, i + 1), ...v },
      }),
    ),
  );
  const varietyIdByCode = new Map(varietyRows.map((v) => [v.code, v.id]));

  const campaignDefs = [
    { code: "2025/2026", name: "Campaña 2025/2026", startDate: new Date("2025-07-01"), isActive: true },
    {
      code: "2024/2025",
      name: "Campaña 2024/2025",
      startDate: new Date("2024-07-01"),
      endDate: new Date("2025-06-30"),
      isActive: false,
    },
  ];
  const campaignRows = await Promise.all(
    campaignDefs.map((c, i) =>
      prisma.campaign.upsert({
        where: { id: uuid(GROUPS.campaign, i + 1) },
        update: {},
        create: { id: uuid(GROUPS.campaign, i + 1), ...c },
      }),
    ),
  );
  const campaignIdByCode = new Map(campaignRows.map((c) => [c.code, c.id]));

  const activityTypeDefs = [
    { code: "harvest", name: "Cosecha", icon: "Combine", requiresCost: true },
    {
      code: "fertilization",
      name: "Fertilización",
      icon: "FlaskConical",
      requiresProduct: true,
      requiresDose: true,
      requiresCost: true,
    },
    { code: "irrigation", name: "Riego", icon: "Droplets", requiresCost: true },
    {
      code: "control",
      name: "Control",
      icon: "Sprout",
      requiresProduct: true,
      requiresDose: true,
      requiresCost: true,
    },
    { code: "soil", name: "Muestreo", icon: "Cylinder" },
    { code: "planting", name: "Siembra", icon: "Sprout", requiresCost: true },
  ];
  const activityTypeRows = await Promise.all(
    activityTypeDefs.map((a, i) =>
      prisma.activityType.upsert({
        where: { id: uuid(GROUPS.activityType, i + 1) },
        update: {},
        create: { id: uuid(GROUPS.activityType, i + 1), ...a },
      }),
    ),
  );
  const activityTypeIdByCode = new Map(activityTypeRows.map((a) => [a.code, a.id]));

  const costCategoryDefs = [
    { code: "labores", name: "Labores", icon: "Tractor" },
    { code: "insumos", name: "Insumos", icon: "Package" },
    { code: "cosecha", name: "Cosecha", icon: "Combine" },
    { code: "transporte", name: "Transporte", icon: "Truck" },
  ];
  const costCategoryRows = await Promise.all(
    costCategoryDefs.map((c, i) =>
      prisma.costCategory.upsert({
        where: { id: uuid(GROUPS.costCategory, i + 1) },
        update: {},
        create: { id: uuid(GROUPS.costCategory, i + 1), ...c },
      }),
    ),
  );
  const costCategoryIdByCode = new Map(costCategoryRows.map((c) => [c.code, c.id]));
  console.log(
    `  ✓ ${statusRows.length} estados, ${varietyRows.length} variedades, ${campaignRows.length} campañas, ` +
      `${activityTypeRows.length} tipos de actividad, ${costCategoryRows.length} categorías de costo`,
  );

  // ── Empresa, establecimiento, proveedor y ajustes ──
  const company = await prisma.company.upsert({
    where: { cuit: DEMO_CUIT },
    update: {},
    create: {
      id: uuid(GROUPS.tenant, 1),
      name: "SmartCaña S.A. (demo)",
      cuit: DEMO_CUIT,
      status: "active",
    },
  });

  const farm = await prisma.farm.upsert({
    where: { id: uuid(GROUPS.tenant, 2) },
    update: {},
    create: {
      id: uuid(GROUPS.tenant, 2),
      companyId: company.id,
      name: "Establecimiento Principal",
      location: "Tucumán, Argentina",
      totalArea: "84.5000",
      latitude: "-26.8328000",
      longitude: "-65.2033000",
      status: "active",
    },
  });

  const supplier = await prisma.supplier.upsert({
    where: { id: uuid(GROUPS.supplier, 1) },
    update: {},
    create: {
      id: uuid(GROUPS.supplier, 1),
      companyId: company.id,
      name: "Proveedor Demo",
      contactName: "Contacto Demo",
      status: "active",
    },
  });

  await prisma.setting.upsert({
    where: { companyId_key: { companyId: company.id, key: "price_per_ton" } },
    update: {},
    create: {
      id: uuid(GROUPS.setting, 1),
      companyId: company.id,
      key: "price_per_ton",
      value: "45000",
    },
  });
  console.log(`  ✓ empresa / establecimiento / proveedor / price_per_ton`);

  // ── Roles y matriz de permisos ──
  const roleRows = await Promise.all(
    roleDefs.map((r, i) =>
      prisma.role.upsert({
        where: { companyId_code: { companyId: company.id, code: r.code } },
        update: {},
        create: {
          id: uuid(GROUPS.role, i + 1),
          companyId: company.id,
          code: r.code,
          name: r.name,
          description: r.description,
          isSystem: r.isSystem,
        },
      }),
    ),
  );
  const roleIdByCode = new Map(roleRows.map((r) => [r.code, r.id]));

  const rolePermissionRows: { id: string; roleId: string; permissionId: string }[] = [];
  let rolePermissionIndex = 1;
  for (const role of roleDefs) {
    const roleId = roleIdByCode.get(role.code);
    if (!roleId) throw new Error(`Rol no encontrado: ${role.code}`);
    for (const code of role.permissions) {
      const permissionId = permissionIdByCode.get(code);
      if (!permissionId) throw new Error(`Permiso no encontrado en BD: ${code}`);
      rolePermissionRows.push({ id: uuid(GROUPS.rolePermission, rolePermissionIndex++), roleId, permissionId });
    }
  }
  await prisma.rolePermission.createMany({ data: rolePermissionRows, skipDuplicates: true });
  console.log(`  ✓ ${roleRows.length} roles, ${rolePermissionRows.length} relaciones rol-permiso`);

  // ── Usuarios demo (ninguno con rol super_admin) ──
  const demoPasswordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const userDefs = [
    {
      key: 1,
      firstName: "Admin",
      lastName: "SmartCaña",
      email: "admin@smartcana.com",
      role: "admin",
      position: "Administrador",
    },
    {
      key: 2,
      firstName: "Ana",
      lastName: "Ingeniera",
      email: "ingeniero@smartcana.com",
      role: "ingeniero",
      position: "Ingeniera agrónoma",
    },
    {
      key: 3,
      firstName: "Carlos",
      lastName: "Operador",
      email: "operador@smartcana.com",
      role: "operador",
      position: "Operador de campo",
    },
  ];
  await Promise.all(
    userDefs.map((u) => {
      const roleId = roleIdByCode.get(u.role);
      if (!roleId) throw new Error(`Rol no encontrado para usuario demo: ${u.role}`);
      return prisma.user.upsert({
        where: { email: u.email },
        update: {},
        create: {
          id: uuid(GROUPS.user, u.key),
          companyId: company.id,
          roleId,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          passwordHash: demoPasswordHash,
          position: u.position,
          status: "active",
        },
      });
    }),
  );
  console.log(`  ✓ ${userDefs.length} usuarios demo (admin, ingeniero, operador)`);

  // ── Campos ──
  const fieldDefs = [
    {
      key: 1,
      name: "El Talita",
      alias: "Lote 4",
      area: "12.5000",
      status: "active",
      variety: "LCP 85-384",
      campaign: "2025/2026",
      plantingDate: "2025-03-15",
      soilType: "Franco arcilloso",
      soilPh: "6.20",
      estimatedProduction: "904.00",
      healthScore: 92,
      shiLevel: "excelente",
      lastActivity: "Cosecha",
      lastActivityAt: "2026-07-28T08:30:00Z",
      color: "#1DB85E",
      latitude: "-26.8328000",
      longitude: "-65.2033000",
    },
    {
      key: 2,
      name: "Los Crespo",
      alias: "Lote 7",
      area: "8.3000",
      status: "harvesting",
      variety: "TUCCP 77-42",
      campaign: "2025/2026",
      plantingDate: "2025-02-20",
      soilType: "Franco arenoso",
      soilPh: "5.80",
      estimatedProduction: "620.00",
      healthScore: 85,
      shiLevel: "excelente",
      lastActivity: "Cosecha en curso",
      lastActivityAt: "2026-07-28T06:15:00Z",
      color: "#F59A00",
      latitude: "-26.8456000",
      longitude: "-65.2189000",
    },
    {
      key: 3,
      name: "La Merced",
      alias: "Lote 2",
      area: "15.0000",
      status: "active",
      variety: "LCP 85-384",
      campaign: "2025/2026",
      plantingDate: "2025-01-10",
      soilType: "Arcilloso",
      soilPh: "6.50",
      estimatedProduction: "985.00",
      healthScore: 68,
      shiLevel: "bueno",
      lastActivity: "Riego",
      lastActivityAt: "2026-07-27T16:00:00Z",
      color: "#3B82F6",
      latitude: "-26.8201000",
      longitude: "-65.1956000",
    },
  ];
  const fieldRows = await Promise.all(
    fieldDefs.map((f) => {
      const fieldStatusId = statusIdByCode.get(f.status);
      const varietyId = varietyIdByCode.get(f.variety);
      if (!fieldStatusId || !varietyId) throw new Error(`Catálogo incompleto para campo ${f.name}`);
      return prisma.field.upsert({
        where: { id: uuid(GROUPS.field, f.key) },
        update: {},
        create: {
          id: uuid(GROUPS.field, f.key),
          farmId: farm.id,
          name: f.name,
          description: f.alias,
          areaHectares: f.area,
          fieldStatusId,
          varietyId,
          plantingDate: new Date(f.plantingDate),
          soilType: f.soilType,
          soilPh: f.soilPh,
          estimatedProduction: f.estimatedProduction,
          healthScore: f.healthScore,
          shiScore: f.healthScore,
          shiLevel: f.shiLevel,
          shiCalculatedAt: new Date("2026-07-28T12:00:00Z"),
          lastActivity: f.lastActivity,
          lastActivityAt: new Date(f.lastActivityAt),
          color: f.color,
          latitude: f.latitude,
          longitude: f.longitude,
          campaignCode: f.campaign,
          ratoonNumber: 1,
        },
      });
    }),
  );
  const fieldIdByName = new Map(fieldRows.map((f) => [f.name, f.id]));
  console.log(`  ✓ ${fieldRows.length} campos`);

  // ── Actividades ──
  const activityDefs = [
    { field: "El Talita", type: "harvest", title: "Cosecha finalizada", date: "2026-07-28", campaign: "2025/2026" },
    {
      field: "El Talita",
      type: "fertilization",
      title: "Fertilización nitrogenada",
      date: "2026-06-15",
      campaign: "2025/2026",
    },
    { field: "Los Crespo", type: "harvest", title: "Inicio de cosecha", date: "2026-07-25", campaign: "2025/2026" },
    {
      field: "Los Crespo",
      type: "fertilization",
      title: "Fertilización potásica",
      date: "2026-05-30",
      campaign: "2025/2026",
    },
    { field: "La Merced", type: "irrigation", title: "Riego programado", date: "2026-07-27", campaign: "2025/2026" },
    {
      field: "La Merced",
      type: "fertilization",
      title: "Fertilización foliar",
      date: "2026-07-10",
      campaign: "2025/2026",
    },
  ];
  await Promise.all(
    activityDefs.map((a, i) => {
      const fieldId = fieldIdByName.get(a.field);
      const activityTypeId = activityTypeIdByCode.get(a.type);
      const campaignId = campaignIdByCode.get(a.campaign);
      if (!fieldId || !activityTypeId || !campaignId) throw new Error(`Referencia incompleta en actividad ${a.title}`);
      return prisma.activity.upsert({
        where: { id: uuid(GROUPS.activity, i + 1) },
        update: {},
        create: {
          id: uuid(GROUPS.activity, i + 1),
          fieldId,
          activityTypeId,
          campaignId,
          activityDate: new Date(a.date),
          title: a.title,
        },
      });
    }),
  );
  console.log(`  ✓ ${activityDefs.length} actividades`);

  // ── Costos ──
  const costDefs = [
    { field: "El Talita", category: "labores", amount: "42000.00", campaign: "2025/2026", date: "2026-07-01" },
    { field: "El Talita", category: "insumos", amount: "31000.00", campaign: "2025/2026", date: "2026-06-01" },
    { field: "Los Crespo", category: "labores", amount: "28000.00", campaign: "2025/2026", date: "2026-07-01" },
    { field: "Los Crespo", category: "cosecha", amount: "18000.00", campaign: "2025/2026", date: "2026-07-25" },
    { field: "La Merced", category: "labores", amount: "52000.00", campaign: "2025/2026", date: "2026-07-01" },
    { field: "La Merced", category: "cosecha", amount: "29000.00", campaign: "2025/2026", date: "2026-07-27" },
  ];
  await Promise.all(
    costDefs.map((c, i) => {
      const fieldId = fieldIdByName.get(c.field);
      const costCategoryId = costCategoryIdByCode.get(c.category);
      const campaignId = campaignIdByCode.get(c.campaign);
      if (!fieldId || !costCategoryId || !campaignId) throw new Error(`Referencia incompleta en costo ${i + 1}`);
      return prisma.cost.upsert({
        where: { id: uuid(GROUPS.cost, i + 1) },
        update: {},
        create: {
          id: uuid(GROUPS.cost, i + 1),
          companyId: company.id,
          farmId: farm.id,
          fieldId,
          costCategoryId,
          supplierId: i === 0 ? supplier.id : null,
          campaignId,
          costDate: new Date(c.date),
          amount: c.amount,
          description: `Costo de ${c.category} - ${c.field}`,
        },
      });
    }),
  );
  console.log(`  ✓ ${costDefs.length} costos`);

  // ── Cosechas ──
  const harvestDefs = [
    {
      field: "El Talita",
      campaign: "2025/2026",
      variety: "LCP 85-384",
      tons: "904.00",
      yield: "72.30",
      date: "2026-07-28",
      sucrose: "12.40",
      humidity: "13.50",
    },
    {
      field: "Los Crespo",
      campaign: "2025/2026",
      variety: "TUCCP 77-42",
      tons: "620.00",
      yield: "74.70",
      date: "2026-07-25",
      sucrose: "11.80",
      humidity: "14.00",
    },
    {
      field: "La Merced",
      campaign: "2025/2026",
      variety: "LCP 85-384",
      tons: "985.00",
      yield: "65.70",
      date: "2026-07-27",
      sucrose: "12.10",
      humidity: "13.80",
    },
  ];
  await Promise.all(
    harvestDefs.map((h, i) => {
      const fieldId = fieldIdByName.get(h.field);
      const campaignId = campaignIdByCode.get(h.campaign);
      const varietyId = varietyIdByCode.get(h.variety);
      if (!fieldId || !campaignId || !varietyId) throw new Error(`Referencia incompleta en cosecha ${h.field}`);
      return prisma.harvest.upsert({
        where: { id: uuid(GROUPS.harvest, i + 1) },
        update: {},
        create: {
          id: uuid(GROUPS.harvest, i + 1),
          companyId: company.id,
          farmId: farm.id,
          fieldId,
          campaignId,
          varietyId,
          startDate: new Date(h.date),
          tons: h.tons,
          tonsPerHectare: h.yield,
          estimatedYield: h.yield,
          method: "Mecánico",
          status: "completed",
          qualityGrade: "A",
          sucrosePercentage: h.sucrose,
          humidity: h.humidity,
        },
      });
    }),
  );
  console.log(`  ✓ ${harvestDefs.length} cosechas`);

  // ── Alertas de campos ──
  const alertDefs = [
    { field: "El Talita", type: "warning", title: "Monitorear plagas post-cosecha", priority: "medium" },
    { field: "La Merced", type: "warning", title: "Bajo rendimiento esperado vs. potencial", priority: "high" },
    { field: "La Merced", type: "info", title: "Próximo muestreo de suelo recomendado", priority: "low" },
  ];
  await Promise.all(
    alertDefs.map((a, i) => {
      const fieldId = fieldIdByName.get(a.field);
      if (!fieldId) throw new Error(`Campo no encontrado para alerta ${a.title}`);
      return prisma.fieldAlert.upsert({
        where: { id: uuid(GROUPS.alert, i + 1) },
        update: {},
        create: {
          id: uuid(GROUPS.alert, i + 1),
          fieldId,
          type: a.type,
          title: a.title,
          priority: a.priority,
        },
      });
    }),
  );
  console.log(`  ✓ ${alertDefs.length} alertas`);

  console.log("\n✅ Seed de desarrollo completado. Credenciales demo exclusivas de desarrollo.");
}

seed()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
