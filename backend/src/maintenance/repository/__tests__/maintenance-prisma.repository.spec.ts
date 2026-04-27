import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma.service';
import { MaintenancePrismaRepository } from '../maintenance-prisma.repository';

describe('MaintenancePrismaRepository', () => {
    let repository: MaintenancePrismaRepository;

    const prisma = {
        maintenance: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
        invoice: {
            create: jest.fn(),
        },
        $transaction: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new MaintenancePrismaRepository(prisma as unknown as PrismaService);
    });

    describe('create', () => {
        it('creates one maintenance item mapping date and decimal fields', async () => {
            const createdMaintenance = { id: 'maintenance-1' };
            prisma.maintenance.create.mockResolvedValue(createdMaintenance);

            const result = await repository.create({
                title: 'Fix sink',
                description: 'Kitchen sink leaking',
                scheduledDate: '2026-04-20',
                status: 'PENDING' as any,
                cost: 250,
                propertyId: 'property-1',
            });

            expect(prisma.maintenance.create).toHaveBeenCalledTimes(1);

            const call = prisma.maintenance.create.mock.calls[0][0];

            expect(call.data.title).toBe('Fix sink');
            expect(call.data.description).toBe('Kitchen sink leaking');
            expect(call.data.scheduledDate).toEqual(new Date('2026-04-20'));
            expect(call.data.status).toBe('PENDING');
            expect(call.data.cost).toEqual(new Prisma.Decimal(250));
            expect(call.data.propertyId).toBe('property-1');

            expect(result).toEqual(createdMaintenance);
        });
    });

    describe('findAll', () => {
        it('finds all maintenance items with property relation', async () => {
            const maintenanceItems = [{ id: 'maintenance-1' }];
            prisma.maintenance.findMany.mockResolvedValue(maintenanceItems);

            const result = await repository.findAll();

            expect(prisma.maintenance.findMany).toHaveBeenCalledWith({
                include: { property: true },
            });
            expect(result).toEqual(maintenanceItems);
        });
    });

    describe('findById', () => {
        it('finds one maintenance item by id with property relation', async () => {
            const maintenance = { id: 'maintenance-1' };
            prisma.maintenance.findUnique.mockResolvedValue(maintenance);

            const result = await repository.findById('maintenance-1');

            expect(prisma.maintenance.findUnique).toHaveBeenCalledWith({
                where: { id: 'maintenance-1' },
                include: { property: true },
            });
            expect(result).toEqual(maintenance);
        });
    });

    describe('updateById', () => {
        it('updates one maintenance item mapping date and decimal fields', async () => {
            const updatedMaintenance = { id: 'maintenance-1' };
            prisma.maintenance.update.mockResolvedValue(updatedMaintenance);

            const result = await repository.updateById('maintenance-1', {
                title: 'Fix shower',
                scheduledDate: '2026-04-25',
                status: 'COMPLETED' as any,
                cost: 400,
                description: 'Done',
                propertyId: 'property-2',
            });

            expect(prisma.maintenance.update).toHaveBeenCalledTimes(1);

            const call = prisma.maintenance.update.mock.calls[0][0];

            expect(call.where).toEqual({ id: 'maintenance-1' });
            expect(call.data.title).toBe('Fix shower');
            expect(call.data.scheduledDate).toEqual(new Date('2026-04-25'));
            expect(call.data.status).toBe('COMPLETED');
            expect(call.data.cost).toEqual(new Prisma.Decimal(400));
            expect(call.data.description).toBe('Done');
            expect(call.data.propertyId).toBe('property-2');

            expect(result).toEqual(updatedMaintenance);
        });

        it('allows null cost on update', async () => {
            prisma.maintenance.update.mockResolvedValue({ id: 'maintenance-1' });

            await repository.updateById('maintenance-1', {
                cost: null,
            });

            const call = prisma.maintenance.update.mock.calls[0][0];
            expect(call.data.cost).toBeNull();
        });
    });

    describe('complete', () => {
        it('completes maintenance and creates expense invoice when requested and cost exists', async () => {
            const completedMaintenance = {
                id: 'maintenance-1',
                title: 'Fix sink',
                cost: new Prisma.Decimal(300),
                propertyId: 'property-1',
                property: { id: 'property-1' },
            };

            const tx = {
                maintenance: {
                    update: jest.fn().mockResolvedValue(completedMaintenance),
                },
                invoice: {
                    create: jest.fn().mockResolvedValue({ id: 'invoice-1' }),
                },
            };

            prisma.$transaction.mockImplementation(async (callback: any) => callback(tx));

            const result = await repository.complete('maintenance-1', true);

            expect(prisma.$transaction).toHaveBeenCalledTimes(1);
            expect(tx.maintenance.update).toHaveBeenCalledWith({
                where: { id: 'maintenance-1' },
                data: { status: 'COMPLETED' },
                include: { property: true },
            });

            expect(tx.invoice.create).toHaveBeenCalledWith({
                data: {
                    type: 'EXPENSE',
                    description: 'Manutenção: Fix sink',
                    amount: completedMaintenance.cost,
                    dueDate: expect.any(Date),
                    status: 'PENDING',
                    propertyId: 'property-1',
                    approvalStatus: 'PENDING',
                }
            });

            expect(result).toEqual(completedMaintenance);
        });

        it('completes maintenance without creating invoice when createInvoice is false', async () => {
            const completedMaintenance = {
                id: 'maintenance-1',
                title: 'Fix sink',
                cost: new Prisma.Decimal(300),
                propertyId: 'property-1',
                property: { id: 'property-1' },
            };

            const tx = {
                maintenance: {
                    update: jest.fn().mockResolvedValue(completedMaintenance),
                },
                invoice: {
                    create: jest.fn(),
                },
            };

            prisma.$transaction.mockImplementation(async (callback: any) => callback(tx));

            const result = await repository.complete('maintenance-1', false);

            expect(tx.invoice.create).not.toHaveBeenCalled();
            expect(result).toEqual(completedMaintenance);
        });

        it('completes maintenance without creating invoice when cost is missing', async () => {
            const completedMaintenance = {
                id: 'maintenance-1',
                title: 'Inspect sink',
                cost: null,
                propertyId: 'property-1',
                property: { id: 'property-1' },
            };

            const tx = {
                maintenance: {
                    update: jest.fn().mockResolvedValue(completedMaintenance),
                },
                invoice: {
                    create: jest.fn(),
                },
            };

            prisma.$transaction.mockImplementation(async (callback: any) => callback(tx));

            await repository.complete('maintenance-1', true);

            expect(tx.invoice.create).not.toHaveBeenCalled();
        });
    });

    describe('removeById', () => {
        it('removes one maintenance item by id', async () => {
            const removedMaintenance = { id: 'maintenance-1' };
            prisma.maintenance.delete.mockResolvedValue(removedMaintenance);

            const result = await repository.removeById('maintenance-1');

            expect(prisma.maintenance.delete).toHaveBeenCalledWith({
                where: { id: 'maintenance-1' },
            });
            expect(result).toEqual(removedMaintenance);
        });
    });
});