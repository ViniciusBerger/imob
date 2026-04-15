import { authApi } from './auth.api';
import { propertiesApi } from './properties.api';
import { maintenanceApi } from './maintenance.api';
import { leasesApi } from './leases.api';
import { financeApi } from './finance.api';
import { statsApi } from './stats.api';
import { usersApi } from './users.api';
import { siteConfigApi } from './site-config.api';

export { API_URL } from './client.api';
export * from './types';

export {
    authApi,
    propertiesApi,
    maintenanceApi,
    leasesApi,
    financeApi,
    statsApi,
    usersApi,
    siteConfigApi,
};

export const api = {
    auth: authApi,
    properties: propertiesApi,
    maintenance: maintenanceApi,
    leases: leasesApi,
    finance: financeApi,
    stats: statsApi,
    users: usersApi,
    siteConfig: siteConfigApi,
};