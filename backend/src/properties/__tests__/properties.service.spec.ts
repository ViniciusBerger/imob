import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesService } from '../properties.service';
import { PropertiesRepository } from '../repository/properties-prisma.repository';
import { CreatePropertyDto, PropertyType } from '../dto/create-property.dto';

describe('PropertiesService', () => {
    let service: PropertiesService;
    let repo: jest.Mocked<PropertiesRepository>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PropertiesService,
                {
                    provide: PropertiesRepository,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findById: jest.fn(),
                        addPhotos: jest.fn(),
                        addDocument: jest.fn(),
                        updateById: jest.fn(),
                        addExpense: jest.fn(),
                        addPropertyExpense: jest.fn(),
                        removePropertyExpense: jest.fn(),
                        addNote: jest.fn(),
                        removeById: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get(PropertiesService);
        repo = module.get(PropertiesRepository);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a property with photos fallback to empty array', async () => {
            const dto = {
                code: 'PROP-001',
                address: '123 Main St',
                type: PropertyType.RESIDENTIAL,
            } as CreatePropertyDto;

            const createdProperty = { id: 'property-1' };
            repo.create.mockResolvedValue(createdProperty as never);

            const result = await service.create(dto);

            expect(repo.create).toHaveBeenCalledWith({
                ...dto,
                photos: [],
            });
            expect(result).toEqual(createdProperty);
        });

        it('should preserve photos when provided', async () => {
            const dto = {
                code: 'PROP-001',
                address: '123 Main St',
                type: PropertyType.RESIDENTIAL,
                photos: ['/uploads/a.jpg'],
            } as CreatePropertyDto;

            const createdProperty = { id: 'property-1' };
            repo.create.mockResolvedValue(createdProperty as never);

            const result = await service.create(dto);

            expect(repo.create).toHaveBeenCalledWith({
                ...dto,
                photos: ['/uploads/a.jpg'],
            });
            expect(result).toEqual(createdProperty);
        });
    });

    describe('findAll', () => {
        it('should return all properties', async () => {
            const properties = [{ id: '1' }, { id: '2' }];
            repo.findAll.mockResolvedValue(properties as never);

            const result = await service.findAll();

            expect(repo.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(properties);
        });
    });

    describe('findOne', () => {
        it('should return one property by id', async () => {
            const property = { id: 'property-1' };
            repo.findById.mockResolvedValue(property as never);

            const result = await service.findOne('property-1');

            expect(repo.findById).toHaveBeenCalledWith('property-1');
            expect(result).toEqual(property);
        });
    });

    describe('addPhotos', () => {
        it('should add photos to a property', async () => {
            const updatedProperty = { id: 'property-1', photos: ['/uploads/a.jpg'] };
            repo.addPhotos.mockResolvedValue(updatedProperty as never);

            const result = await service.addPhotos('property-1', ['/uploads/a.jpg']);

            expect(repo.addPhotos).toHaveBeenCalledWith('property-1', ['/uploads/a.jpg']);
            expect(result).toEqual(updatedProperty);
        });
    });

    describe('addDocument', () => {
        it('should add a document to a property', async () => {
            const createdDocument = { id: 'doc-1' };
            repo.addDocument.mockResolvedValue(createdDocument as never);

            const result = await service.addDocument(
                'property-1',
                'Lease Contract',
                '/uploads/lease.pdf',
                'application/pdf',
            );

            expect(repo.addDocument).toHaveBeenCalledWith({
                title: 'Lease Contract',
                filePath: '/uploads/lease.pdf',
                fileType: 'application/pdf',
                propertyId: 'property-1',
            });
            expect(result).toEqual(createdDocument);
        });
    });

    describe('update', () => {
        it('should update a property', async () => {
            const updatePayload = {
                nickname: 'Updated nickname',
                description: 'Updated description',
            };

            const updatedProperty = { id: 'property-1' };
            repo.updateById.mockResolvedValue(updatedProperty as never);

            const result = await service.update('property-1', updatePayload);

            expect(repo.updateById).toHaveBeenCalledWith('property-1', updatePayload);
            expect(result).toEqual(updatedProperty);
        });
    });

    describe('addExpense', () => {
        it('should add an expense to a property', async () => {
            const expensePayload = {
                amount: 1200,
                date: '2026-04-21',
                type: 'maintenance',
                description: 'Plumbing repair',
            };

            const createdExpense = { id: 'expense-1' };
            repo.addExpense.mockResolvedValue(createdExpense as never);

            const result = await service.addExpense('property-1', expensePayload);

            expect(repo.addExpense).toHaveBeenCalledWith('property-1', expensePayload);
            expect(result).toEqual(createdExpense);
        });
    });

    describe('addPropertyExpense', () => {
        it('should add a recurring property expense', async () => {
            const propertyExpensePayload = {
                name: 'Condo fee',
                value: 450,
                frequency: 'monthly',
                dueDay: 1,
            };

            const createdPropertyExpense = { id: 'property-expense-1' };
            repo.addPropertyExpense.mockResolvedValue(createdPropertyExpense as never);

            const result = await service.addPropertyExpense('property-1', propertyExpensePayload);

            expect(repo.addPropertyExpense).toHaveBeenCalledWith('property-1', propertyExpensePayload);
            expect(result).toEqual(createdPropertyExpense);
        });
    });

    describe('removePropertyExpense', () => {
        it('should remove one recurring property expense', async () => {
            const deletedPropertyExpense = { id: 'property-expense-1' };
            repo.removePropertyExpense.mockResolvedValue(deletedPropertyExpense as never);

            const result = await service.removePropertyExpense('property-expense-1');

            expect(repo.removePropertyExpense).toHaveBeenCalledWith('property-expense-1');
            expect(result).toEqual(deletedPropertyExpense);
        });
    });

    describe('addNote', () => {
        it('should add a note using propertyId and userId', async () => {
            const createdNote = { id: 'note-1' };
            repo.addNote.mockResolvedValue(createdNote as never);

            const result = await service.addNote('property-1', 'user-1', 'Important note');

            expect(repo.addNote).toHaveBeenCalledWith({
                content: 'Important note',
                propertyId: 'property-1',
                userId: 'user-1',
            });
            expect(result).toEqual(createdNote);
        });
    });

    describe('remove', () => {
        it('should soft delete one property', async () => {
            const deletedProperty = { id: 'property-1' };
            repo.removeById.mockResolvedValue(deletedProperty as never);

            const result = await service.remove('property-1');

            expect(repo.removeById).toHaveBeenCalledWith('property-1');
            expect(result).toEqual(deletedProperty);
        });
    });
});