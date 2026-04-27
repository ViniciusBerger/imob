import { MaintenanceService } from '../maintenance.service';

describe('MaintenanceService', () => {
    let service: MaintenanceService;

    const maintenanceRepo = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        updateById: jest.fn(),
        complete: jest.fn(),
        removeById: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        service = new MaintenanceService(maintenanceRepo as any);
    });

    describe('create', () => {
        it('delegates maintenance creation to repository', async () => {
            const input = {
                title: 'Fix sink',
                description: 'Kitchen sink leaking',
                scheduledDate: '2026-04-20',
                status: 'PENDING',
                cost: 250,
                propertyId: 'property-1',
            };

            const createdMaintenance = { id: 'maintenance-1' };
            maintenanceRepo.create.mockResolvedValue(createdMaintenance);

            const result = await service.create(input as any);

            expect(maintenanceRepo.create).toHaveBeenCalledWith(input);
            expect(result).toEqual(createdMaintenance);
        });
    });

    describe('findAll', () => {
        it('delegates maintenance listing to repository', async () => {
            const maintenanceItems = [{ id: 'maintenance-1' }];
            maintenanceRepo.findAll.mockResolvedValue(maintenanceItems);

            const result = await service.findAll();

            expect(maintenanceRepo.findAll).toHaveBeenCalledWith();
            expect(result).toEqual(maintenanceItems);
        });
    });

    describe('findOne', () => {
        it('delegates maintenance lookup by id to repository', async () => {
            const maintenance = { id: 'maintenance-1' };
            maintenanceRepo.findById.mockResolvedValue(maintenance);

            const result = await service.findOne('maintenance-1');

            expect(maintenanceRepo.findById).toHaveBeenCalledWith('maintenance-1');
            expect(result).toEqual(maintenance);
        });
    });

    describe('update', () => {
        it('delegates maintenance update to repository', async () => {
            const data = { description: 'updated' };
            const updatedMaintenance = { id: 'maintenance-1', ...data };
            maintenanceRepo.updateById.mockResolvedValue(updatedMaintenance);

            const result = await service.update('maintenance-1', data as any);

            expect(maintenanceRepo.updateById).toHaveBeenCalledWith('maintenance-1', data);
            expect(result).toEqual(updatedMaintenance);
        });
    });

    describe('complete', () => {
        it('delegates maintenance completion to repository', async () => {
            const completedMaintenance = { id: 'maintenance-1', status: 'COMPLETED' };
            maintenanceRepo.complete.mockResolvedValue(completedMaintenance);

            const result = await service.complete('maintenance-1', true);

            expect(maintenanceRepo.complete).toHaveBeenCalledWith('maintenance-1', true);
            expect(result).toEqual(completedMaintenance);
        });
    });

    describe('remove', () => {
        it('delegates maintenance removal to repository', async () => {
            const removedMaintenance = { id: 'maintenance-1' };
            maintenanceRepo.removeById.mockResolvedValue(removedMaintenance);

            const result = await service.remove('maintenance-1');

            expect(maintenanceRepo.removeById).toHaveBeenCalledWith('maintenance-1');
            expect(result).toEqual(removedMaintenance);
        });
    });
});