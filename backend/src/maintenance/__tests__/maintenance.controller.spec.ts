import { MaintenanceController } from '../maintenance.controller';

describe('MaintenanceController', () => {
    let controller: MaintenanceController;

    const maintenanceService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        complete: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new MaintenanceController(maintenanceService as any);
    });

    describe('create', () => {
        it('maps dto to service input and delegates to service', async () => {
            const dto = {
                title: 'Fix sink',
                description: 'Kitchen sink leaking',
                scheduledDate: '2026-04-20',
                status: 'PENDING',
                cost: 250,
                propertyId: 'property-1',
            };

            const createdMaintenance = { id: 'maintenance-1' };
            maintenanceService.create.mockResolvedValue(createdMaintenance);

            const result = await controller.create(dto as any);

            expect(maintenanceService.create).toHaveBeenCalledWith({
                title: 'Fix sink',
                description: 'Kitchen sink leaking',
                scheduledDate: '2026-04-20',
                status: 'PENDING',
                cost: 250,
                propertyId: 'property-1',
            });
            expect(result).toEqual(createdMaintenance);
        });
    });

    describe('findAll', () => {
        it('delegates maintenance listing to service', async () => {
            const maintenanceItems = [{ id: 'maintenance-1' }];
            maintenanceService.findAll.mockResolvedValue(maintenanceItems);

            const result = await controller.findAll();

            expect(maintenanceService.findAll).toHaveBeenCalledWith();
            expect(result).toEqual(maintenanceItems);
        });
    });

    describe('findOne', () => {
        it('delegates maintenance lookup by id to service', async () => {
            const maintenance = { id: 'maintenance-1' };
            maintenanceService.findOne.mockResolvedValue(maintenance);

            const result = await controller.findOne('maintenance-1');

            expect(maintenanceService.findOne).toHaveBeenCalledWith('maintenance-1');
            expect(result).toEqual(maintenance);
        });
    });

    describe('update', () => {
        it('maps update body and delegates to service', async () => {
            const body = {
                title: 'Fix shower',
                description: 'Updated',
                scheduledDate: '2026-04-25',
                status: 'COMPLETED',
                cost: 400,
                propertyId: 'property-2',
            };

            const updatedMaintenance = { id: 'maintenance-1', ...body };
            maintenanceService.update.mockResolvedValue(updatedMaintenance);

            const result = await controller.update('maintenance-1', body);

            expect(maintenanceService.update).toHaveBeenCalledWith('maintenance-1', {
                title: 'Fix shower',
                description: 'Updated',
                scheduledDate: '2026-04-25',
                status: 'COMPLETED',
                cost: 400,
                propertyId: 'property-2',
            });
            expect(result).toEqual(updatedMaintenance);
        });
    });

    describe('complete', () => {
        it('delegates completion payload to service', async () => {
            const completedMaintenance = { id: 'maintenance-1', status: 'COMPLETED' };
            maintenanceService.complete.mockResolvedValue(completedMaintenance);

            const result = await controller.complete('maintenance-1', {
                createInvoice: true,
            });

            expect(maintenanceService.complete).toHaveBeenCalledWith('maintenance-1', true);
            expect(result).toEqual(completedMaintenance);
        });
    });

    describe('remove', () => {
        it('delegates maintenance removal to service', async () => {
            const removedMaintenance = { id: 'maintenance-1' };
            maintenanceService.remove.mockResolvedValue(removedMaintenance);

            const result = await controller.remove('maintenance-1');

            expect(maintenanceService.remove).toHaveBeenCalledWith('maintenance-1');
            expect(result).toEqual(removedMaintenance);
        });
    });
});