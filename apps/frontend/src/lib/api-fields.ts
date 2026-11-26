import { api } from "./api";
import type { FieldData, HistoricalProduction, FieldCost, FieldActivity, FieldAlert } from "@/types/fields";

interface BackendField {
  id: string;
  name: string;
  description: string | null;
  areaHectares: number;
  fieldStatusId: string;
  varietyId: string | null;
  plantingDate: string | null;
  ratoonNumber: number;
  soilType: string | null;
  soilPh: number | null;
  estimatedProduction: number | null;
  healthScore: number | null;
  shiScore?: number | null;
  shiLevel?: string | null;
  shiCalculatedAt?: string | null;
  lastActivity: string | null;
  lastActivityAt: string | null;
  color: string | null;
  latitude: number | null;
  longitude: number | null;
  campaignCode: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  fieldStatus?: { code: string; name: string } | null;
  variety?: { code: string; name: string } | null;
  activities?: BackendActivity[];
  costs?: BackendCost[];
  harvests?: BackendHarvest[];
  alerts?: BackendAlert[];
}

interface BackendActivity {
  id: string;
  activityType: { code: string; name: string; icon: string | null };
  title: string;
  activityDate: string;
}

interface BackendCost {
  costCategory: { code: string; name: string };
  amount: number;
}

interface BackendHarvest {
  id: string;
  campaign: { code: string; name: string };
  tons: number;
  estimatedYield: number | null;
  startDate: string;
}

interface BackendAlert {
  id: string;
  type: string;
  title: string;
  priority: string;
}

const STATUS_MAP: Record<string, FieldData["status"]> = {
  active: "active",
  inactive: "inactive",
  harvesting: "harvesting",
  resting: "resting",
  fallow: "resting",
  preparing: "active",
  harvested: "harvesting",
};

function mapField(b: BackendField): FieldData {
  const status = STATUS_MAP[b.fieldStatus?.code ?? "active"] ?? "active";
  const variety = b.variety?.code ?? "LCP 85-384";
  const campaign = b.campaignCode ?? "2025/2026";

  const costs = aggregateCosts(b.costs ?? []);
  const activities = (b.activities ?? []).map((a): FieldActivity => ({
    id: a.id,
    type: a.activityType.code,
    title: a.title,
    date: a.activityDate.slice(0, 10),
  }));
  const alerts = (b.alerts ?? []).map((a): FieldAlert => ({
    id: a.id,
    type: a.type,
    title: a.title,
    priority: a.priority as FieldAlert["priority"],
  }));

  const historical = buildHistoricalProduction(b.harvests ?? []);

  return {
    id: b.id,
    name: b.name,
    alias: b.description ?? undefined,
    surfaceHa: Number(b.areaHectares),
    variety,
    campaign,
    status,
    estimatedProduction: Number(b.estimatedProduction ?? 0),
    healthScore: b.healthScore ?? 50,
    shiScore: b.shiScore ?? null,
    shiLevel: b.shiLevel ?? null,
    shiCalculatedAt: b.shiCalculatedAt ?? null,
    lastActivity: b.lastActivity ?? "",
    lastActivityDate: b.lastActivityAt ?? "",
    color: b.color ?? "#1DB85E",
    location: {
      lat: Number(b.latitude ?? -26.83),
      lng: Number(b.longitude ?? -65.20),
    },
    plantingDate: b.plantingDate?.slice(0, 10) ?? "",
    soilType: b.soilType ?? "",
    soilPh: Number(b.soilPh ?? 6),
    irrigation: "Gravedad",
    historicalProduction: historical,
    costs,
    activities,
    alerts,
    harvests: (b.harvests ?? []).map((h) => ({
      id: h.id,
      campaignName: h.campaign?.name || h.campaign?.code || "",
      tons: Number(h.tons),
      startDate: h.startDate,
    })),
  };
}

function aggregateCosts(costs: BackendCost[]): FieldCost[] {
  const grouped: Record<string, number> = {};
  for (const c of costs) {
    const key = c.costCategory.name;
    grouped[key] = (grouped[key] || 0) + Number(c.amount);
  }
  return Object.entries(grouped).map(([category, value]) => ({
    category,
    value,
  }));
}

function buildHistoricalProduction(harvests: BackendHarvest[]): HistoricalProduction[] {
  return harvests.map((h) => ({
    campaign: h.campaign.name || h.campaign.code,
    production: Number(h.tons),
    yield_: Number(h.estimatedYield ?? 0),
  }));
}

// Sin fallback mock: un 401/403/500 se propaga para que la UI lo muestre.
export async function fetchFields(): Promise<{ data: FieldData[]; meta: Record<string, unknown> | null }> {
  const res = await api.get<BackendField[]>("/fields");
  const data = (res.data ?? []).map(mapField);
  return { data, meta: res.meta ?? null };
}

export async function fetchFieldById(id: string): Promise<FieldData | null> {
  const res = await api.get<BackendField>(`/fields/${id}`);
  return res.data ? mapField(res.data) : null;
}

export async function createField(data: Partial<FieldData>): Promise<FieldData> {
  const res = await api.post<BackendField>("/fields", {
    name: data.name,
    description: data.alias,
    areaHectares: data.surfaceHa,
    soilType: data.soilType,
    estimatedProduction: data.estimatedProduction,
    healthScore: data.healthScore,
    latitude: data.location?.lat,
    longitude: data.location?.lng,
    plantingDate: data.plantingDate,
    color: data.color,
    campaignCode: data.campaign,
  });
  return mapField(res.data);
}

export async function updateField(id: string, data: Partial<FieldData>): Promise<FieldData> {
  const res = await api.patch<BackendField>(`/fields/${id}`, {
    name: data.name,
    description: data.alias,
    areaHectares: data.surfaceHa,
    soilType: data.soilType,
    estimatedProduction: data.estimatedProduction,
    healthScore: data.healthScore,
    latitude: data.location?.lat,
    longitude: data.location?.lng,
    color: data.color,
  });
  return mapField(res.data);
}

export async function deleteField(id: string): Promise<void> {
  await api.delete(`/fields/${id}`);
}
