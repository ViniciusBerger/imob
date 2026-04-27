import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PropertiesController } from '../properties.controller';
import { PropertiesService } from '../properties.service';
import { CreatePropertyDto, PropertyType } from '../dto/create-property.dto';

describe('PropertiesController', () => {
    let controller: PropertiesController;
    let service: jest.Mocked<PropertiesService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PropertiesController],
            providers: [
                {
                    provide: PropertiesService,
                    useValue: {
                        create: jest.fn(),
                        findAll: jest.fn(),
                        findOne: jest.fn(),
                        addPhotos: jest.fn(),
                        addDocument: jest.fn(),
                        update: jest.fn(),
                        addExpense: jest.fn(),
                        addPropertyExpense: jest.fn(),
                        removePropertyExpense: jest.fn(),
                        addNote: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get(PropertiesController);
        service = module.get(PropertiesService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create one property', async () => {
            const dto = {
                code: 'PROP-001',
                address: '123 Main St',
                type: PropertyType.RESIDENTIAL,
            } as CreatePropertyDto;

            const createdProperty = { id: 'property-1' };
            service.create.mockResolvedValue(createdProperty as never);

            const result = await controller.create(dto);

            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(createdProperty);
        });
    });

    describe('uploadPhotos', () => {
        it('should upload photos and map file paths', async () => {
            const files = [
                { filename: 'a.jpg' },
                { filename: 'b.jpg' },
            ] as Array<Express.Multer.File>;

            const updatedProperty = { id: 'property-1' };
            service.addPhotos.mockResolvedValue(updatedProperty as never);

            const result = await controller.uploadPhotos('property-1', files);

            expect(service.addPhotos).toHaveBeenCalledWith('property-1', [
                '/uploads/a.jpg',
                '/uploads/b.jpg',
            ]);
            expect(result).toEqual(updatedProperty);
        });

        it('should throw when no photos are uploaded', () => {
            expect(() => controller.uploadPhotos('property-1', [])).toThrow(BadRequestException);
        });
    });

    describe('uploadDocument', () => {
        it('should upload one document using provided title', async () => {
            const files = [
                {
                    filename: 'lease.pdf',
                    originalname: 'original-lease.pdf',
                    mimetype: 'application/pdf',
                },
            ] as Array<Express.Multer.File>;

            const createdDocument = { id: 'doc-1' };
            service.addDocument.mockResolvedValue(createdDocument as never);

            const result = await controller.uploadDocument('property-1', 'Lease File', files);

            expect(service.addDocument).toHaveBeenCalledWith(
                'property-1',
                'Lease File',
                '/uploads/lease.pdf',
                'application/pdf',
            );
            expect(result).toEqual(createdDocument);
        });

        it('should fallback to original file name when title is missing', async () => {
            const files = [
                {
                    filename: 'lease.pdf',
                    originalname: 'original-lease.pdf',
                    mimetype: 'application/pdf',
                },
            ] as Array<Express.Multer.File>;

            const createdDocument = { id: 'doc-1' };
            service.addDocument.mockResolvedValue(createdDocument as never);

            const result = await controller.uploadDocument('property-1', '', files);

            expect(service.addDocument).toHaveBeenCalledWith(
                'property-1',
                'original-lease.pdf',
                '/uploads/lease.pdf',
                'application/pdf',
            );
            expect(result).toEqual(createdDocument);
        });

        it('should throw when no document file is uploaded', () => {
            expect(() => controller.uploadDocument('property-1', 'Lease File', [])).toThrow(BadRequestException);
        });
    });

    describe('findAll', () => {
        it('should return all properties', async () => {
            const properties = [{ id: '1' }, { id: '2' }];
            service.findAll.mockResolvedValue(properties as never);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalledTimes(1);
            expect(result).toEqual(properties);
        });
    });

    describe('findOne', () => {
        it('should return one property', async () => {
            const property = { id: 'property-1' };
            service.findOne.mockResolvedValue(property as never);

            const result = await controller.findOne('property-1');

            expect(service.findOne).toHaveBeenCalledWith('property-1');
            expect(result).toEqual(property);
        });
    });

    describe('addExpense', () => {
        it('should add an expense', async () => {
            const body = {
                amount: 1000,
                date: '2026-04-21',
                type: 'maintenance',
                description: 'Repair',
            };

            const expense = { id: 'expense-1' };
            service.addExpense.mockResolvedValue(expense as never);

            const result = await controller.addExpense('property-1', body);

            expect(service.addExpense).toHaveBeenCalledWith('property-1', body);
            expect(result).toEqual(expense);
        });
    });

    describe('addPropertyExpense', () => {
        it('should add a recurring property expense', async () => {
            const body = {
                name: 'Insurance',
                value: 200,
                frequency: 'monthly',
                dueDay: 5,
            };

            const propertyExpense = { id: 'property-expense-1' };
            service.addPropertyExpense.mockResolvedValue(propertyExpense as never);

            const result = await controller.addPropertyExpense('property-1', body);

            expect(service.addPropertyExpense).toHaveBeenCalledWith('property-1', body);
            expect(result).toEqual(propertyExpense);
        });
    });

    describe('removePropertyExpense', () => {
        it('should remove one recurring property expense', async () => {
            const deletedExpense = { id: 'property-expense-1' };
            service.removePropertyExpense.mockResolvedValue(deletedExpense as never);

            const result = await controller.removePropertyExpense('property-expense-1');

            expect(service.removePropertyExpense).toHaveBeenCalledWith('property-expense-1');
            expect(result).toEqual(deletedExpense);
        });
    });

    describe('addNote', () => {
        it('should use req.user.id instead of body.userId', async () => {
            const body = {
                content: 'Important property note',
                userId: 'body-user-id-should-not-be-used',
            } as any;

            const req = {
                user: {
                    id: 'authenticated-user-id',
                },
            } as any;

            const note = { id: 'note-1' };
            service.addNote.mockResolvedValue(note as never);

            const result = await controller.addNote('property-1', body, req);

            expect(service.addNote).toHaveBeenCalledWith(
                'property-1',
                'authenticated-user-id',
                'Important property note',
            );
            expect(result).toEqual(note);
        });
    });

    describe('update', () => {
        it('should update one property', async () => {
            const body = {
                nickname: 'Updated property',
                description: 'Updated description',
            };

            const updatedProperty = { id: 'property-1' };
            service.update.mockResolvedValue(updatedProperty as never);

            const result = await controller.update('property-1', body);

            expect(service.update).toHaveBeenCalledWith('property-1', body);
            expect(result).toEqual(updatedProperty);
        });
    });

    describe('remove', () => {
        it('should remove one property', async () => {
            const deletedProperty = { id: 'property-1' };
            service.remove.mockResolvedValue(deletedProperty as never);

            const result = await controller.remove('property-1');

            expect(service.remove).toHaveBeenCalledWith('property-1');
            expect(result).toEqual(deletedProperty);
        });
    });
});