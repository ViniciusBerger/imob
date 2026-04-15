export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    user: AuthUser;
}

export interface SiteConfig {
    id: string;
    appName: string;
    seoTitle?: string;
    seoDescription?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroBackgroundImage?: string;
    contactPhone?: string;
    contactEmail?: string;
    contactWhatsApp?: string;
    primaryColor: string;
    layoutType: string;
    showPrices: boolean;
    showUnavailable: boolean;
    logoUrl?: string;
    faviconUrl?: string;
}

export interface UpdateSiteConfigDto extends Partial<SiteConfig> {}

export interface PropertyExpense {
    id: string;
    name: string;
    value: number | string;
    frequency: 'MONTHLY' | 'YEARLY' | 'ONCE' | 'CUSTOM';
    dueDateDay?: number;
    active: boolean;
    autoGenerate: boolean;
}

export interface Property {
    id: string;
    code: string;
    address: string;
    type: string;
    rentPrice?: number;
    salePrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    garage?: number;
    area?: number;
    description?: string;
    photos: string[];
    leases?: any[];
    documents?: any[];
    maintenances?: any[];
    notes?: any[];
    status?: string;
    nickname?: string;
    city?: string;
    state?: string;
    propertyExpenses?: any[];
}

export interface Transaction {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    description: string;
    amount: number;
    date: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE';
    category?: string;
    propertyId?: string;
    property?: { address: string };
}

export interface DashboardStats {
    totalProperties: number;
    availableProperties: number;
    rentedProperties: number;
    occupancyRate: number;
    financials?: {
        totalRevenue: number;
        totalFixedCosts: number;
        netIncome: number;
        patrimony: {
            assets: number;
            liabilities: number;
            netWorth: number;
        };
        cashFlow: {
            projectedIncome: number;
            realizedIncome: number;
            projectedExpenses: number;
            realizedExpenses: number;
        };
    };
    alerts: {
        expiringContracts: Array<{
            id: string;
            propertyCode: string;
            propertyTitle: string;
            endDate: string;
        }>;
    };
}