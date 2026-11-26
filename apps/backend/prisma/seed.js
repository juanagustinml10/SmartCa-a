import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const permissionDefs = [
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
const roleDefs = [
    {
        code: "super_admin",
        name: "Super Administrador",
        description: "Acceso total al sistema",
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
        permissions: ALL_CODES.filter((c) => !c.startsWith("users.") &&
            !c.startsWith("roles.") &&
            !c.startsWith("permissions.") &&
            !c.startsWith("companies.") &&
            !c.startsWith("sessions.") &&
            !c.startsWith("audit.") &&
            c !== "settings.manage"),
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
    console.log("🌱 Seeding SmartCaña database...");
    await prisma.permission.createMany({
        data: permissionDefs,
        skipDuplicates: true,
    });
    const allPermissions = await prisma.permission.findMany();
    const permMap = Object.fromEntries(allPermissions.map((p) => [p.code, p.id]));
    console.log(`  ✓ ${allPermissions.length} permisos`);
    const statuses = await Promise.all([
        prisma.fieldStatus.upsert({ where: { code: "active" }, update: {}, create: { code: "active", name: "En producción" } }),
        prisma.fieldStatus.upsert({ where: { code: "harvesting" }, update: {}, create: { code: "harvesting", name: "En cosecha" } }),
        prisma.fieldStatus.upsert({ where: { code: "resting" }, update: {}, create: { code: "resting", name: "En descanso" } }),
        prisma.fieldStatus.upsert({ where: { code: "inactive" }, update: {}, create: { code: "inactive", name: "Inactivo" } }),
    ]);
    const statusMap = Object.fromEntries(statuses.map((s) => [s.code, s.id]));
    console.log(`  ✓ ${statuses.length} estados de campo`);
    const varieties = await Promise.all([
        prisma.variety.upsert({ where: { code: "LCP 85-384" }, update: {}, create: { code: "LCP 85-384", name: "LCP 85-384", origin: "INTA/EEA Tucumán", cycle: "Medio", potentialYieldMin: 60, potentialYieldMax: 85, diseaseTolerance: "Resistente a roya", pestTolerance: "Tolerante a barrenador", waterRequirement: "Medio", soilPreference: "Franco arcilloso" } }),
        prisma.variety.upsert({ where: { code: "TUCCP 77-42" }, update: {}, create: { code: "TUCCP 77-42", name: "TUCCP 77-42", origin: "INTA/EEA Tucumán", cycle: "Precoz", potentialYieldMin: 55, potentialYieldMax: 80, diseaseTolerance: "Moderadamente resistente", pestTolerance: "Moderada", waterRequirement: "Bajo-Medio", soilPreference: "Franco arenoso" } }),
        prisma.variety.upsert({ where: { code: "RA 87-3" }, update: {}, create: { code: "RA 87-3", name: "RA 87-3", origin: "INTA/EEA Tucumán", cycle: "Tardío", potentialYieldMin: 50, potentialYieldMax: 75, diseaseTolerance: "Resistente a carbón", pestTolerance: "Tolerante", waterRequirement: "Medio-Alto", soilPreference: "Franco" } }),
    ]);
    const varietyMap = Object.fromEntries(varieties.map((v) => [v.code, v.id]));
    console.log(`  ✓ ${varieties.length} variedades`);
    const campaigns = await Promise.all([
        prisma.campaign.upsert({ where: { code: "2025/2026" }, update: {}, create: { code: "2025/2026", name: "Campaña 2025/2026", startDate: new Date("2025-07-01"), isActive: true } }),
        prisma.campaign.upsert({ where: { code: "2024/2025" }, update: {}, create: { code: "2024/2025", name: "Campaña 2024/2025", startDate: new Date("2024-07-01"), endDate: new Date("2025-06-30"), isActive: false } }),
        prisma.campaign.upsert({ where: { code: "2023/2024" }, update: {}, create: { code: "2023/2024", name: "Campaña 2023/2024", startDate: new Date("2023-07-01"), endDate: new Date("2024-06-30"), isActive: false } }),
    ]);
    const campaignMap = Object.fromEntries(campaigns.map((c) => [c.code, c.id]));
    console.log(`  ✓ ${campaigns.length} campañas`);
    const activityTypes = await Promise.all([
        prisma.activityType.upsert({ where: { code: "harvest" }, update: {}, create: { code: "harvest", name: "Cosecha", icon: "Combine", requiresCost: true } }),
        prisma.activityType.upsert({ where: { code: "fertilization" }, update: {}, create: { code: "fertilization", name: "Fertilización", icon: "FlaskConical", requiresProduct: true, requiresDose: true, requiresCost: true } }),
        prisma.activityType.upsert({ where: { code: "irrigation" }, update: {}, create: { code: "irrigation", name: "Riego", icon: "Droplets", requiresCost: true } }),
        prisma.activityType.upsert({ where: { code: "control" }, update: {}, create: { code: "control", name: "Control", icon: "Sprout", requiresProduct: true, requiresDose: true, requiresCost: true } }),
        prisma.activityType.upsert({ where: { code: "soil" }, update: {}, create: { code: "soil", name: "Muestreo", icon: "Cylinder" } }),
        prisma.activityType.upsert({ where: { code: "planting" }, update: {}, create: { code: "planting", name: "Siembra", icon: "Sprout", requiresCost: true } }),
    ]);
    const activityTypeMap = Object.fromEntries(activityTypes.map((a) => [a.code, a.id]));
    console.log(`  ✓ ${activityTypes.length} tipos de actividad`);
    const costCategories = await Promise.all([
        prisma.costCategory.upsert({ where: { code: "labores" }, update: {}, create: { code: "labores", name: "Labores", icon: "Tractor" } }),
        prisma.costCategory.upsert({ where: { code: "insumos" }, update: {}, create: { code: "insumos", name: "Insumos", icon: "Package" } }),
        prisma.costCategory.upsert({ where: { code: "cosecha" }, update: {}, create: { code: "cosecha", name: "Cosecha", icon: "Combine" } }),
        prisma.costCategory.upsert({ where: { code: "transporte" }, update: {}, create: { code: "transporte", name: "Transporte", icon: "Truck" } }),
    ]);
    const costCategoryMap = Object.fromEntries(costCategories.map((c) => [c.code, c.id]));
    console.log(`  ✓ ${costCategories.length} categorías de costo`);
    const company = await prisma.company.upsert({
        where: { cuit: "30-12345678-9" },
        update: {},
        create: {
            id: "default-company",
            name: "SmartCaña S.A.",
            cuit: "30-12345678-9",
            status: "active",
        },
    });
    const farm = await prisma.farm.upsert({
        where: { id: "default-farm" },
        update: {},
        create: {
            id: "default-farm",
            companyId: company.id,
            name: "Establecimiento Principal",
            location: "Tucumán, Argentina",
            status: "active",
        },
    });
    console.log(`  ✓ ${company.name} / ${farm.name}`);
    const roleResults = await Promise.all(roleDefs.map((r) => prisma.role.upsert({
        where: { companyId_code: { companyId: company.id, code: r.code } },
        update: {},
        create: {
            companyId: company.id,
            code: r.code,
            name: r.name,
            description: r.description,
            isSystem: r.isSystem,
        },
    })));
    const roleMap = Object.fromEntries(roleResults.map((r) => [r.code, r.id]));
    console.log(`  ✓ ${roleResults.length} roles`);
    const rolePermissionData = [];
    for (const r of roleDefs) {
        const roleId = roleMap[r.code];
        for (const permCode of r.permissions) {
            const permissionId = permMap[permCode];
            if (permissionId) {
                rolePermissionData.push({ roleId, permissionId });
            }
        }
    }
    await prisma.rolePermission.createMany({
        data: rolePermissionData,
        skipDuplicates: true,
    });
    console.log(`  ✓ ${rolePermissionData.length} role-permissions`);
    const adminPasswordHash = bcrypt.hashSync("admin123", 10);
    await prisma.user.upsert({
        where: { email: "admin@smartcana.com" },
        update: {},
        create: {
            companyId: company.id,
            roleId: roleMap["admin"],
            firstName: "Admin",
            lastName: "SmartCaña",
            email: "admin@smartcana.com",
            passwordHash: adminPasswordHash,
            position: "Administrador",
            status: "active",
        },
    });
    console.log(`  ✓ Admin user (admin@smartcana.com)`);
    const fieldData = [
        { name: "El Talita", alias: "Lote 4", area: 12.5, variety: "LCP 85-384", campaign: "2025/2026", status: "active", color: "#1DB85E", lat: -26.8328, lng: -65.2033, plantingDate: "2025-03-15", soilType: "Franco arcilloso", soilPh: 6.2, estimatedProduction: 904, healthScore: 92, lastActivity: "Cosecha", lastActivityAt: "2026-07-28T08:30:00" },
        { name: "Los Crespo", alias: "Lote 7", area: 8.3, variety: "TUCCP 77-42", campaign: "2025/2026", status: "harvesting", color: "#F59A00", lat: -26.8456, lng: -65.2189, plantingDate: "2025-02-20", soilType: "Franco arenoso", soilPh: 5.8, estimatedProduction: 620, healthScore: 85, lastActivity: "Cosecha en curso", lastActivityAt: "2026-07-28T06:15:00" },
        { name: "La Merced", alias: "Lote 2", area: 15.0, variety: "LCP 85-384", campaign: "2025/2026", status: "active", color: "#3B82F6", lat: -26.8201, lng: -65.1956, plantingDate: "2025-01-10", soilType: "Arcilloso", soilPh: 6.5, estimatedProduction: 985, healthScore: 68, lastActivity: "Riego", lastActivityAt: "2026-07-27T16:00:00" },
        { name: "San Antonio", alias: "Lote 5", area: 10.2, variety: "RA 87-3", campaign: "2025/2026", status: "active", color: "#8B5CF6", lat: -26.8389, lng: -65.2104, plantingDate: "2025-04-01", soilType: "Franco", soilPh: 6.0, estimatedProduction: 710, healthScore: 78, lastActivity: "Control de malezas", lastActivityAt: "2026-07-27T11:30:00" },
        { name: "El Ochenta", alias: "Lote 8", area: 20.0, variety: "LCP 85-384", campaign: "2024/2025", status: "resting", color: "#06B6D4", lat: -26.8550, lng: -65.2250, plantingDate: "2024-03-10", soilType: "Franco arcilloso", soilPh: 6.3, estimatedProduction: 0, healthScore: 55, lastActivity: "Barbecho", lastActivityAt: "2026-06-01T09:00:00" },
        { name: "La Loma", alias: "Lote 1", area: 18.5, variety: "TUCCP 77-42", campaign: "2025/2026", status: "active", color: "#EC4899", lat: -26.8100, lng: -65.1900, plantingDate: "2025-02-01", soilType: "Franco arenoso", soilPh: 5.9, estimatedProduction: 1280, healthScore: 88, lastActivity: "Fertilización", lastActivityAt: "2026-07-22T10:00:00" },
        { name: "San José", alias: "Lote 3", area: 6.8, variety: "LCP 85-384", campaign: "2025/2026", status: "inactive", color: "#EF4444", lat: -26.8280, lng: -65.2080, plantingDate: "2025-03-20", soilType: "Arcilloso pesado", soilPh: 5.5, estimatedProduction: 410, healthScore: 42, lastActivity: "Muestreo", lastActivityAt: "2026-07-26T09:00:00" },
        { name: "Santa Rosa", alias: "Lote 6", area: 14.0, variety: "RA 87-3", campaign: "2025/2026", status: "active", color: "#84CC16", lat: -26.8420, lng: -65.2150, plantingDate: "2025-01-25", soilType: "Franco", soilPh: 6.1, estimatedProduction: 980, healthScore: 81, lastActivity: "Riego", lastActivityAt: "2026-07-25T14:00:00" },
        { name: "El Puesto", alias: "Lote 9", area: 22.0, variety: "LCP 85-384", campaign: "2024/2025", status: "harvesting", color: "#F97316", lat: -26.8600, lng: -65.2300, plantingDate: "2024-02-15", soilType: "Franco arenoso", soilPh: 6.4, estimatedProduction: 1580, healthScore: 90, lastActivity: "Cosecha mecanizada", lastActivityAt: "2026-07-26T07:00:00" },
        { name: "La Esperanza", alias: "Lote 10", area: 5.2, variety: "TUCCP 77-42", campaign: "2025/2026", status: "active", color: "#06B6D4", lat: -26.8150, lng: -65.2000, plantingDate: "2025-04-15", soilType: "Franco", soilPh: 6.0, estimatedProduction: 350, healthScore: 72, lastActivity: "Fertilización", lastActivityAt: "2026-07-18T08:00:00" },
    ];
    const fields = await Promise.all(fieldData.map((f) => prisma.field.upsert({
        where: { id: f.name.toLowerCase().replace(/\s+/g, "-") },
        update: {},
        create: {
            id: f.name.toLowerCase().replace(/\s+/g, "-"),
            farmId: farm.id,
            name: f.name,
            description: f.alias,
            areaHectares: f.area,
            fieldStatusId: statusMap[f.status],
            varietyId: varietyMap[f.variety],
            plantingDate: new Date(f.plantingDate),
            soilType: f.soilType,
            soilPh: f.soilPh,
            estimatedProduction: f.estimatedProduction,
            healthScore: f.healthScore,
            shiScore: f.healthScore,
            shiLevel: f.healthScore >= 80 ? 'excelente' : f.healthScore >= 60 ? 'bueno' : f.healthScore >= 40 ? 'regular' : 'critico',
            shiCalculatedAt: new Date(),
            lastActivity: f.lastActivity,
            lastActivityAt: new Date(f.lastActivityAt),
            color: f.color,
            latitude: f.lat,
            longitude: f.lng,
            campaignCode: f.campaign,
            ratoonNumber: 1,
        },
    })));
    console.log(`  ✓ ${fields.length} campos`);
    const activitiesData = [
        { field: "El Talita", type: "harvest", title: "Cosecha finalizada", date: "2026-07-28", campaign: "2025/2026" },
        { field: "El Talita", type: "fertilization", title: "Fertilización nitrogenada", date: "2026-06-15", campaign: "2025/2026" },
        { field: "El Talita", type: "control", title: "Control de malezas", date: "2026-05-20", campaign: "2025/2026" },
        { field: "El Talita", type: "soil", title: "Muestreo de suelo", date: "2026-04-10", campaign: "2025/2026" },
        { field: "Los Crespo", type: "harvest", title: "Inicio de cosecha", date: "2026-07-25", campaign: "2025/2026" },
        { field: "Los Crespo", type: "fertilization", title: "Fertilización potásica", date: "2026-05-30", campaign: "2025/2026" },
        { field: "La Merced", type: "irrigation", title: "Riego programado", date: "2026-07-27", campaign: "2025/2026" },
        { field: "La Merced", type: "fertilization", title: "Fertilización foliar", date: "2026-07-10", campaign: "2025/2026" },
        { field: "San Antonio", type: "control", title: "Control de malezas", date: "2026-07-27", campaign: "2025/2026" },
        { field: "San Antonio", type: "fertilization", title: "Fertilización nitrogenada", date: "2026-06-20", campaign: "2025/2026" },
        { field: "La Loma", type: "fertilization", title: "Fertilización nitrogenada", date: "2026-07-22", campaign: "2025/2026" },
        { field: "La Loma", type: "control", title: "Control de malezas", date: "2026-06-28", campaign: "2025/2026" },
        { field: "Santa Rosa", type: "irrigation", title: "Riego por pivote", date: "2026-07-25", campaign: "2025/2026" },
        { field: "Santa Rosa", type: "fertilization", title: "Fertilización potásica", date: "2026-07-05", campaign: "2025/2026" },
        { field: "El Puesto", type: "harvest", title: "Cosecha mecanizada", date: "2026-07-26", campaign: "2024/2025" },
        { field: "El Puesto", type: "control", title: "Control de malezas", date: "2026-06-10", campaign: "2024/2025" },
        { field: "La Esperanza", type: "fertilization", title: "Fertilización nitrogenada", date: "2026-07-18", campaign: "2025/2026" },
    ];
    const fieldIndex = Object.fromEntries(fields.map((f) => [f.name, f.id]));
    await Promise.all(activitiesData.map((a) => prisma.activity.upsert({
        where: { id: `${fieldIndex[a.field]}-${a.type}-${a.date}` },
        update: {},
        create: {
            id: `${fieldIndex[a.field]}-${a.type}-${a.date}`,
            fieldId: fieldIndex[a.field],
            activityTypeId: activityTypeMap[a.type],
            campaignId: campaignMap[a.campaign] || campaignMap["2025/2026"],
            activityDate: new Date(a.date),
            title: a.title,
        },
    })));
    console.log(`  ✓ ${activitiesData.length} actividades`);
    const costsData = [
        { field: "El Talita", category: "labores", amount: 42000, campaign: "2025/2026", date: "2026-07-01" },
        { field: "El Talita", category: "insumos", amount: 31000, campaign: "2025/2026", date: "2026-06-01" },
        { field: "El Talita", category: "cosecha", amount: 24000, campaign: "2025/2026", date: "2026-07-28" },
        { field: "El Talita", category: "transporte", amount: 8500, campaign: "2025/2026", date: "2026-07-28" },
        { field: "Los Crespo", category: "labores", amount: 28000, campaign: "2025/2026", date: "2026-07-01" },
        { field: "Los Crespo", category: "insumos", amount: 22000, campaign: "2025/2026", date: "2026-06-01" },
        { field: "Los Crespo", category: "cosecha", amount: 18000, campaign: "2025/2026", date: "2026-07-25" },
        { field: "Los Crespo", category: "transporte", amount: 6000, campaign: "2025/2026", date: "2026-07-25" },
        { field: "La Merced", category: "labores", amount: 52000, campaign: "2025/2026", date: "2026-07-01" },
        { field: "La Merced", category: "insumos", amount: 38000, campaign: "2025/2026", date: "2026-06-01" },
        { field: "La Merced", category: "cosecha", amount: 29000, campaign: "2025/2026", date: "2026-07-27" },
        { field: "La Merced", category: "transporte", amount: 11000, campaign: "2025/2026", date: "2026-07-27" },
    ];
    await Promise.all(costsData.map((c, i) => prisma.cost.create({
        data: {
            companyId: company.id,
            farmId: farm.id,
            fieldId: fieldIndex[c.field],
            costCategoryId: costCategoryMap[c.category],
            campaignId: campaignMap[c.campaign],
            costDate: new Date(c.date),
            amount: c.amount,
            description: `Costo de ${c.category} - ${c.field}`,
        },
    })));
    console.log(`  ✓ ${costsData.length} costos`);
    const harvestsData = [
        { field: "El Talita", campaign: "2025/2026", variety: "LCP 85-384", tons: 904, yield: 72.3, date: "2026-07-28", method: "Mecánico" },
        { field: "Los Crespo", campaign: "2025/2026", variety: "TUCCP 77-42", tons: 620, yield: 74.7, date: "2026-07-25", method: "Mecánico" },
        { field: "La Merced", campaign: "2025/2026", variety: "LCP 85-384", tons: 985, yield: 65.7, date: "2026-07-27", method: "Mecánico" },
        { field: "El Puesto", campaign: "2024/2025", variety: "LCP 85-384", tons: 1510, yield: 68.6, date: "2026-07-26", method: "Mecánico" },
    ];
    await Promise.all(harvestsData.map((h) => prisma.harvest.create({
        data: {
            companyId: company.id,
            farmId: farm.id,
            fieldId: fieldIndex[h.field],
            campaignId: campaignMap[h.campaign],
            varietyId: varietyMap[h.variety],
            startDate: new Date(h.date),
            tons: h.tons,
            tonsPerHectare: h.yield,
            estimatedYield: h.yield,
            method: h.method,
            status: 'completed',
            qualityGrade: h.tons > 800 ? 'A' : 'B',
            sucrosePercentage: 11.5 + Math.random() * 2.5,
            humidity: 12 + Math.random() * 4,
        },
    })));
    console.log(`  ✓ ${harvestsData.length} cosechas`);
    const alertsData = [
        { field: "El Talita", type: "warning", title: "Monitorear plagas post-cosecha", priority: "medium" },
        { field: "La Merced", type: "warning", title: "Bajo rendimiento esperado vs. potencial", priority: "high" },
        { field: "La Merced", type: "info", title: "Próximo muestreo de suelo recomendado", priority: "low" },
        { field: "El Ochenta", type: "info", title: "Planificar siembra próxima campaña", priority: "medium" },
        { field: "San José", type: "critical", title: "Rendimiento crítico: intervención urgente", priority: "critical" },
        { field: "San José", type: "warning", title: "pH fuera de rango óptimo", priority: "high" },
    ];
    await Promise.all(alertsData.map((a) => prisma.fieldAlert.create({
        data: {
            fieldId: fieldIndex[a.field],
            type: a.type,
            title: a.title,
            priority: a.priority,
        },
    })));
    console.log(`  ✓ ${alertsData.length} alertas`);
    console.log("\n✅ Seed completado exitosamente");
}
seed()
    .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map