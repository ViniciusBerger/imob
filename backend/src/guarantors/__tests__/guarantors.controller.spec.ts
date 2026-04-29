import { GuarantorsController } from '../guarantors.controller';
import { GuarantorsService } from '../guarantors.service';

describe('GuarantorsController', () => {
    let controller: GuarantorsController;

    const guarantorsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    } as unknown as jest.Mocked<GuarantorsService>;

    beforeEach(() => {
        jest.clearAllMocks();
        controller = new GuarantorsController(guarantorsService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a guarantor', async () => {
            const body = {
                name: 'Jane Guarantor',
                document: '12345678900',
                email: 'guarantor@test.com',
                phone: '555-1111',
            };

            const guarantor = {
                id: 'guarantor-1',
                ...body,
            };

            guarantorsService.create.mockResolvedValue(guarantor as any);

            const result = await controller.create(body);

            expect(result).toBe(guarantor);
            expect(guarantorsService.create).toHaveBeenCalledWith(body);
        });
    });

    describe('findAll', () => {
        it('should return all guarantors', async () => {
            const guarantors = [
                {
                    id: 'guarantor-1',
                    name: 'Jane Guarantor',
                    document: '12345678900',
                    email: 'guarantor@test.com',
                    tenants: [],
                },
            ];

            guarantorsService.findAll.mockResolvedValue(guarantors as any);

            const result = await controller.findAll();

            expect(result).toBe(guarantors);
            expect(guarantorsService.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return one guarantor by id', async () => {
            const guarantor = {
                id: 'guarantor-1',
                name: 'Jane Guarantor',
                document: '12345678900',
                email: 'guarantor@test.com',
                tenants: [],
            };

            guarantorsService.findOne.mockResolvedValue(guarantor as any);

            const result = await controller.findOne('guarantor-1');

            expect(result).toBe(guarantor);
            expect(guarantorsService.findOne).toHaveBeenCalledWith('guarantor-1');
        });
    });

    describe('update', () => {
        it('should update a guarantor', async () => {
            const body = {
                name: 'Updated Guarantor',
                email: 'updated@test.com',
            };

            const guarantor = {
                id: 'guarantor-1',
                name: 'Updated Guarantor',
                document: '12345678900',
                email: 'updated@test.com',
            };

            guarantorsService.update.mockResolvedValue(guarantor as any);

            const result = await controller.update('guarantor-1', body);

            expect(result).toBe(guarantor);
            expect(guarantorsService.update).toHaveBeenCalledWith('guarantor-1', body);
        });
    });

    describe('remove', () => {
        it('should remove a guarantor by id', async () => {
            const guarantor = {
                id: 'guarantor-1',
                name: 'Jane Guarantor',
                document: '12345678900',
            };

            guarantorsService.remove.mockResolvedValue(guarantor as any);

            const result = await controller.remove('guarantor-1');

            expect(result).toBe(guarantor);
            expect(guarantorsService.remove).toHaveBeenCalledWith('guarantor-1');
        });
    });
});