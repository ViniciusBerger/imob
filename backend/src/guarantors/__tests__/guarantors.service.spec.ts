import { GuarantorsRepository } from '../repository/guarantors-prisma.repository';
import { GuarantorsService } from '../guarantors.service';

describe('GuarantorsService', () => {
    let service: GuarantorsService;

    const guarantorsRepository = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        updateById: jest.fn(),
        deleteById: jest.fn(),
    } as unknown as jest.Mocked<GuarantorsRepository>;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new GuarantorsService(guarantorsRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a guarantor', async () => {
            const guarantor = {
                id: 'guarantor-1',
                name: 'Jane Guarantor',
                document: '12345678900',
                email: 'guarantor@test.com',
                phone: '555-1111',
            };

            guarantorsRepository.create.mockResolvedValue(guarantor);

            const result = await service.create({
                name: 'Jane Guarantor',
                document: '12345678900',
                email: 'guarantor@test.com',
                phone: '555-1111',
            });

            expect(result).toBe(guarantor);
            expect(guarantorsRepository.create).toHaveBeenCalledWith({
                name: 'Jane Guarantor',
                document: '12345678900',
                email: 'guarantor@test.com',
                phone: '555-1111',
            });
        });

        it('should normalize empty optional fields to null', async () => {
            const guarantor = {
                id: 'guarantor-1',
                name: 'Jane Guarantor',
                document: '12345678900',
                email: null,
                phone: null,
            };

            guarantorsRepository.create.mockResolvedValue(guarantor);

            await service.create({
                name: 'Jane Guarantor',
                document: '12345678900',
                email: '',
                phone: '',
            });

            expect(guarantorsRepository.create).toHaveBeenCalledWith({
                name: 'Jane Guarantor',
                document: '12345678900',
                email: null,
                phone: null,
            });
        });

        it('should throw a friendly error when document is duplicated', async () => {
            guarantorsRepository.create.mockRejectedValue({ code: 'P2002' });

            await expect(
                service.create({
                    name: 'Jane Guarantor',
                    document: '12345678900',
                    email: null,
                    phone: null,
                }),
            ).rejects.toThrow('Já existe um fiador com este Documento (CPF).');
        });

        it('should rethrow unknown create errors', async () => {
            const error = new Error('Database unavailable');
            guarantorsRepository.create.mockRejectedValue(error);

            await expect(
                service.create({
                    name: 'Jane Guarantor',
                    document: '12345678900',
                    email: null,
                    phone: null,
                }),
            ).rejects.toThrow(error);
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
                    phone: null,
                    tenants: [],
                },
            ];

            guarantorsRepository.findAll.mockResolvedValue(guarantors);

            const result = await service.findAll();

            expect(result).toBe(guarantors);
            expect(guarantorsRepository.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should find one guarantor by id', async () => {
            const guarantor = {
                id: 'guarantor-1',
                name: 'Jane Guarantor',
                document: '12345678900',
                email: 'guarantor@test.com',
                phone: null,
                tenants: [],
            };

            guarantorsRepository.findById.mockResolvedValue(guarantor);

            const result = await service.findOne('guarantor-1');

            expect(result).toBe(guarantor);
            expect(guarantorsRepository.findById).toHaveBeenCalledWith('guarantor-1');
        });
    });

    describe('update', () => {
        it('should update a guarantor', async () => {
            const guarantor = {
                id: 'guarantor-1',
                name: 'Updated Guarantor',
                document: '12345678900',
                email: 'updated@test.com',
                phone: null,
            };

            guarantorsRepository.updateById.mockResolvedValue(guarantor);

            const result = await service.update('guarantor-1', {
                name: 'Updated Guarantor',
                document: '12345678900',
                email: 'updated@test.com',
                phone: '',
            });

            expect(result).toBe(guarantor);
            expect(guarantorsRepository.updateById).toHaveBeenCalledWith(
                'guarantor-1',
                {
                    name: 'Updated Guarantor',
                    document: '12345678900',
                    email: 'updated@test.com',
                    phone: null,
                },
            );
        });

        it('should throw a friendly error when document is duplicated', async () => {
            guarantorsRepository.updateById.mockRejectedValue({ code: 'P2002' });

            await expect(
                service.update('guarantor-1', {
                    document: '12345678900',
                }),
            ).rejects.toThrow('Já existe um fiador com este Documento (CPF).');
        });

        it('should rethrow unknown update errors', async () => {
            const error = new Error('Database unavailable');
            guarantorsRepository.updateById.mockRejectedValue(error);

            await expect(
                service.update('guarantor-1', {
                    name: 'Updated Guarantor',
                }),
            ).rejects.toThrow(error);
        });
    });

    describe('remove', () => {
        it('should delete a guarantor by id', async () => {
            const guarantor = {
                id: 'guarantor-1',
                name: 'Jane Guarantor',
                document: '12345678900',
                email: 'guarantor@test.com',
                phone: null,
            };

            guarantorsRepository.deleteById.mockResolvedValue(guarantor);

            const result = await service.remove('guarantor-1');

            expect(result).toBe(guarantor);
            expect(guarantorsRepository.deleteById).toHaveBeenCalledWith(
                'guarantor-1',
            );
        });
    });
});