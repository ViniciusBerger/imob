import { authApi } from './auth.api';
import { propertiesApi } from './properties.api';
import { maintenanceApi } from './maintenance.api';
import { leasesApi } from './leases.api';
import { financeApi } from './finance.api';
import { statsApi } from './stats.api';
import { usersApi } from './users.api';
import { siteConfigApi } from './site-config.api';
import { expensesApi } from './expenses.api';
import { guarantorsApi } from './guarantors.api';
import { tenantsApi } from './tenants.api';
import { tenantPortalApi } from './tenant-portal.api';
import { invoicesApi } from './invoices.api';

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
    expensesApi,
    guarantorsApi,
    tenantsApi,
    tenantPortalApi,
    invoicesApi
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
    expenses: expensesApi,
    guarantors: guarantorsApi,
    tenants: tenantsApi,
    tenantPortal: tenantPortalApi,
    invoices: invoicesApi
};