import { describe, it, expect } from 'vitest';
import {
    api,
    authApi,
    propertiesApi,
    maintenanceApi,
    leasesApi,
    financeApi,
    statsApi,
    usersApi,
    siteConfigApi,
} from '../index';

describe('api index exports', () => {
    it('should expose the grouped api object', () => {
        expect(api.auth).toBe(authApi);
        expect(api.properties).toBe(propertiesApi);
        expect(api.maintenance).toBe(maintenanceApi);
        expect(api.leases).toBe(leasesApi);
        expect(api.finance).toBe(financeApi);
        expect(api.stats).toBe(statsApi);
        expect(api.users).toBe(usersApi);
        expect(api.siteConfig).toBe(siteConfigApi);
    });
});