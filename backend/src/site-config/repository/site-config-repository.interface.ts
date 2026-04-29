export type SiteConfigLayoutType = 'MODERN_GRID' | 'CLASSIC' | 'MINIMAL';

export type SiteConfigRecord = {
    id: string;
    appName: string;
    primaryColor: string;
    layoutType: string;
    showPrices: boolean;
};

export type CreateSiteConfigRecordData = {
    appName: string;
    primaryColor: string;
    layoutType: string;
    showPrices: boolean;
};

export type UpdateSiteConfigRecordData = {
    appName?: string;
    primaryColor?: string;
    layoutType?: string;
    showPrices?: boolean;
};

export interface ISiteConfigRepository {
    findFirst(): Promise<SiteConfigRecord | null>;
    create(data: CreateSiteConfigRecordData): Promise<SiteConfigRecord>;
    updateById(id: string, data: UpdateSiteConfigRecordData): Promise<SiteConfigRecord>;
}