import { LeasesController } from '../leases.controller';

describe('LeasesController', () => {
    let controller: LeasesController;

    const leasesService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        applyAdjustment: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new LeasesController(leasesService as any);
    });

    describe('create', () => {
        it('delegates lease creation to service', async () => {
            const dto = {
                type: 'RENT',
                startDate: '2026-01-01',
                endDate: '2026-12-31',
                rentValue: 1500,
                rentDueDay: 5,
                propertyId: 'property-1',
                tenantId: 'tenant-1',
                guarantorId: 'guarantor-1',
                adjustmentRate: 2,
                adjustmentIndex: 'IPCA',
                autoRenew: false,
                notes: 'Lease note',
            };

            const createdLease = { id: 'lease-1' };
            leasesService.create.mockResolvedValue(createdLease);

            const result = await controller.create(dto as any);

            expect(leasesService.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(createdLease);
        });
    });

    describe('findAll', () => {
        it('delegates lease listing to service', async () => {
            const leases = [{ id: 'lease-1' }, { id: 'lease-2' }];
            leasesService.findAll.mockResolvedValue(leases);

            const result = await controller.findAll();

            expect(leasesService.findAll).toHaveBeenCalledWith();
            expect(result).toEqual(leases);
        });
    });

    describe('findOne', () => {
        it('delegates lease lookup by id to service', async () => {
            const lease = { id: 'lease-1' };
            leasesService.findOne.mockResolvedValue(lease);

            const result = await controller.findOne('lease-1');

            expect(leasesService.findOne).toHaveBeenCalledWith('lease-1');
            expect(result).toEqual(lease);
        });
    });

    describe('applyAdjustment', () => {
        it('delegates adjustment payload to service', async () => {
            const body = {
                rate: 10,
                indexName: 'IPCA',
                date: '2026-04-01',
            };

            const adjustedLease = { id: 'lease-1', rentValue: 1650 };
            leasesService.applyAdjustment.mockResolvedValue(adjustedLease);

            const result = await controller.applyAdjustment('lease-1', body);

            expect(leasesService.applyAdjustment).toHaveBeenCalledWith('lease-1', body);
            expect(result).toEqual(adjustedLease);
        });

        it('delegates partial adjustment payload to service', async () => {
            const body = {
                indexName: 'IGPM',
            };

            const adjustedLease = { id: 'lease-1', rentValue: 1600 };
            leasesService.applyAdjustment.mockResolvedValue(adjustedLease);

            const result = await controller.applyAdjustment('lease-1', body);

            expect(leasesService.applyAdjustment).toHaveBeenCalledWith('lease-1', body);
            expect(result).toEqual(adjustedLease);
        });
    });
});