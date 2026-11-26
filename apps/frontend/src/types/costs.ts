export type CostStatus = 'active' | 'cancelled' | 'draft';

export interface CostCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  companyId: string;
  name: string;
  cuit?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  status: string;
}

export interface CostItem {
  id: string;
  companyId: string;
  farmId?: string;
  farmName?: string;
  fieldId?: string;
  fieldName?: string;
  costCategoryId: string;
  costCategory?: CostCategory;
  supplierId?: string;
  supplier?: Supplier;
  activityId?: string;
  campaignId: string;
  campaignName?: string;
  userId?: string;
  description?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
  amount: number;
  currency: string;
  costDate: string;
  status: CostStatus;
  receiptUrl?: string;
  observations?: string;
  createdAt: string;
}

export interface CostFiltersState {
  search: string;
  companyId: string;
  farmId: string;
  fieldId: string;
  categoryId: string;
  supplierId: string;
  campaignId: string;
  status: string;
  userId: string;
  startDate: string;
  endDate: string;
}

export type CostView = 'dashboard' | 'byCategory' | 'byField' | 'bySupplier' | 'byMonth' | 'byCampaign';

export interface CostAnalytics {
  totalAmount: number;
  totalByCategory: { categoryId: string; categoryName: string; total: number; percentage: number }[];
  totalByField: { fieldId: string; fieldName: string; total: number; percentage: number }[];
  totalByMonth: { month: string; year: number; total: number }[];
  totalByCampaign: { campaignId: string; campaignName: string; total: number }[];
  costPerHectare: number;
  averageMonthlyCost: number;
}

export interface CostAlert {
  id: string;
  type: 'high_cost' | 'duplicate' | 'field_overage' | 'category_above_average' | 'significant_deviation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  amount?: number;
  percentage?: number;
  timestamp: string;
}
