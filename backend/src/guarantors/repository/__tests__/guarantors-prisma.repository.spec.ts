import { PrismaService } from '../../../prisma.service';
import { GuarantorsRepository } from '../guarantors-prisma.repository';

describe('GuarantorsRepository', () => {
    let repository: GuarantorsRepository;

    const prisma = {
        guarantor: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    } as unknown as PrismaService;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new GuarantorsRepository(prisma);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('create', () => {
        it('should create a guarantor with nullable optional fields', async () => {
            const guarantor = {
                id: 'guarantor-1',
                name: 'Jane Guarantor',
                document: '12345678900',
                email: null,
                phone: null,
            };

            (prisma.guarantor.create as jest.Mock).mockResolvedValue(guarantor);

            const result = await repository.create({
                name: 'Jane Guarantor',
                document: '12345678900',
                email: '',
                phone: '',
            });

            expect(result).toBe(guarantor);
            expect(prisma.guarantor.create).toHaveBeenCalledWith({
                data: {
                    name: 'Jane Guarantor',
                    document: '12345678900',
                    email: null,
                    phone: null,
                },
            });
        });

        it('should create a guarantor with provided optional fields', async () => {
            const guarantor = {
                id: 'guarantor-1',
                name: 'Jane Guarantor',
                document: '12345678900',
                email: 'guarantor@test.com',
                phone: '555-1111',
            };

            (prisma.guarantor.create as jest.Mock).mockResolvedValue(guarantor);

            const result = await repository.create({
                name: 'Jane Guarantor',
                document: '12345678900',
                email: 'guarantor@test.com',
                phone: '555-1111',
            });

            expect(result).toBe(guarantor);
            expect(prisma.guarantor.create).toHaveBeenCalledWith({
                data: {
                    name: 'Jane Guarantor',
                    document: '12345678900',
                    email: 'guarantor@test.com',
                    phone: '555-1111',
                },
            });
        });
    });

    describe('findAll', () => {
        it('should find all guarantors with tenants', async () => {
            const guarantors = [{ id: 'guarantor-1' }];

            (prisma.guarantor.findMany as jest.Mock).mockResolvedValue(guarantors);

            const result = await repository.findAll();

            expect(result).toBe(guarantors);
            expect(prisma.guarantor.findMany).toHaveBeenCalledWith({
                include: {
                    tenants: true,
                },
            });
        });
    });

    describe('findById', () => {
        it('should find a guarantor by id with tenants', async () => {
            const guarantor = { id: 'guarantor-1' };

            (prisma.guarantor.findUnique as jest.Mock).mockResolvedValue(guarantor);

            const result = await repository.findById('guarantor-1');

            expect(result).toBe(guarantor);
            expect(prisma.guarantor.findUnique).toHaveBeenCalledWith({
                where: { id: 'guarantor-1' },
                include: {
                    tenants: true,
                },
            });
        });
    });

    describe('updateById', () => {
        it('should update a guarantor by id', async () => {
            const guarantor = {
                id: 'guarantor-1',
                name: 'Updated Guarantor',
            };

            (prisma.guarantor.update as jest.Mock).mockResolvedValue(guarantor);

            const result = await repository.updateById('guarantor-1', {
                name: 'Updated Guarantor',
                document: '12345678900',
                email: '',
                phone: '',
            });

            expect(result).toBe(guarantor);
            expect(prisma.guarantor.update).toHaveBeenCalledWith({
                where: { id: 'guarantor-1' },
                data: {
                    name: 'Updated Guarantor',
                    document: '12345678900',
                    email: null,
                    phone: null,
                },
            });
        });
    });

    describe('deleteById', () => {
        it('should delete a guarantor by id', async () => {
            const guarantor = { id: 'guarantor-1' };

            (prisma.guarantor.delete as jest.Mock).mockResolvedValue(guarantor);

            const result = await repository.deleteById('guarantor-1');

            expect(result).toBe(guarantor);
            expect(prisma.guarantor.delete).toHaveBeenCalledWith({
                where: { id: 'guarantor-1' },
            });
        });
    });
});