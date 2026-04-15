import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PropertiesModule } from './properties/properties.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { GuarantorsModule } from './guarantors/guarantors.module';
import { ConfigModule } from '@nestjs/config';
import { LeasesModule } from './leases/leases.module';
import { ExpensesModule } from './expenses/expenses.module';
import { StatsModule } from './stats/stats.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AuditModule } from './audit/audit.module';
import { SiteConfigModule } from './site-config/site-config.module';

import { EconomicIndicesModule } from './economic-indices/economic-indices.module';

@Module({
    imports: [
        ServeStaticModule.forRoot(
            {
                rootPath: join(__dirname, '..', 'client'),
                exclude: ['/api/(.*)', '/uploads/(.*)'],
            },
            {
                rootPath: join(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
                serveStaticOptions: {
                    index: false,
                    fallthrough: false,
                },
            }
        ),
    
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '../.env', // because .env is one level above backend
    }),
        PropertiesModule,
        AuthModule,
        UsersModule,
        TenantsModule,
        GuarantorsModule,
        LeasesModule,
        ExpensesModule,
        StatsModule,
        MaintenanceModule,
        InvoicesModule,
        AuditModule,
        SiteConfigModule,
        EconomicIndicesModule, // Added
    ],
})
export class AppModule { }
