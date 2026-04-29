export type EconomicIndexRecord = {
    id: string;
    name: string;
    date: Date;
    value: number;
};

export type UpsertEconomicIndexRateRecordData = {
    name: string;
    date: Date | string;
    value: number;
};

export interface IEconomicIndicesRepository {
    upsertRate(data: UpsertEconomicIndexRateRecordData): Promise<EconomicIndexRecord>;
    findRecent(name?: string): Promise<EconomicIndexRecord[]>;
    findRatesInRange(
        name: string,
        startDate: Date,
        endDate: Date,
    ): Promise<EconomicIndexRecord[]>;
}