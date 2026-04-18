import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LeasesService } from '../leases.service';

describe('LeasesService', () => {
  let service: LeasesService;

  const leaseRepo = {
    findById: jest.fn(),
    findAll: jest.fn(),
    createWithInitialInvoices: jest.fn(),
    updateAdjustmentById: jest.fn(),
    renewById: jest.fn(),
    markInactive: jest.fn(),
    updateById: jest.fn(),
  };

  const indicesService = {
    getAccumulatedRate: jest.fn(),
  };

  const makeLease = (overrides: Partial<any> = {}) => ({
    id: 'lease-1',
    startDate: new Date(2026, 0, 1),
    endDate: new Date(2026, 11, 31),
    rentValue: 1000,
    rentDueDay: 5,
    propertyId: 'property-1',
    tenantId: 'tenant-1',
    guarantorId: null,
    adjustmentRate: null,
    adjustmentIndex: null,
    lastAdjustmentDate: null,
    autoRenew: false,
    isActive: true,
    notes: '',
    property: { id: 'property-1' },
    tenant: { id: 'tenant-1' },
    guarantor: null,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2026-04-01T00:00:00.000Z'));

    service = new LeasesService(leaseRepo as any, indicesService as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('applyAdjustment', () => {
    it('throws NotFoundException when lease does not exist', async () => {
      leaseRepo.findById.mockResolvedValue(null);

      await expect(
        service.applyAdjustment('missing-id', { rate: 10 }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('applies a manual rate', async () => {
      const lease = makeLease({ rentValue: 1000 });
      const updatedLease = { ...lease, rentValue: 1100 };

      leaseRepo.findById.mockResolvedValue(lease);
      leaseRepo.updateAdjustmentById.mockResolvedValue(updatedLease);

      const result = await service.applyAdjustment('lease-1', { rate: 10 });

      expect(leaseRepo.updateAdjustmentById).toHaveBeenCalledWith(
        'lease-1',
        expect.objectContaining({
          rentValue: 1100,
          adjustmentRate: 10,
          lastAdjustmentDate: new Date('2026-04-01T00:00:00.000Z'),
        }),
      );

      expect(result).toEqual(updatedLease);
    });

    it('calculates the rate from index history when manual rate is missing', async () => {
      const lease = makeLease({
        rentValue: 1000,
        lastAdjustmentDate: new Date('2025-04-01T00:00:00.000Z'),
      });

      leaseRepo.findById.mockResolvedValue(lease);
      leaseRepo.updateAdjustmentById.mockResolvedValue({ ...lease, rentValue: 1065 });
      indicesService.getAccumulatedRate.mockResolvedValue(6.5);

      await service.applyAdjustment('lease-1', {
        indexName: 'IPCA',
        date: '2026-03-01T00:00:00.000Z',
      });

      expect(indicesService.getAccumulatedRate).toHaveBeenCalledWith(
        'IPCA',
        lease.lastAdjustmentDate,
        new Date('2026-03-01T00:00:00.000Z'),
      );

      expect(leaseRepo.updateAdjustmentById).toHaveBeenCalledWith(
        'lease-1',
        expect.objectContaining({
          rentValue: 1065,
          adjustmentRate: 6.5,
        }),
      );
    });

    it('throws BadRequestException when rate cannot be resolved', async () => {
      const lease = makeLease();
      leaseRepo.findById.mockResolvedValue(lease);

      await expect(
        service.applyAdjustment('lease-1', {}),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('create', () => {
    it('builds leaseData and invoiceDrafts, then delegates to repository', async () => {
      const createdLease = makeLease();
      leaseRepo.createWithInitialInvoices.mockResolvedValue(createdLease);

      const input = {
        type: 'RENT',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-03-31T00:00:00.000Z',
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

      const result = await service.create(input as any);

      expect(leaseRepo.createWithInitialInvoices).toHaveBeenCalledTimes(1);

      const [leaseData, invoiceDrafts] =
        leaseRepo.createWithInitialInvoices.mock.calls[0];

      expect(leaseData).toEqual({
        type: 'RENT',
        startDate: '2026-01-01T00:00:00.000Z',
        endDate: '2026-03-31T00:00:00.000Z',
        rentValue: 1500,
        rentDueDay: 5,
        adjustmentRate: 2,
        adjustmentIndex: 'IPCA',
        autoRenew: false,
        notes: 'Lease note',
        propertyId: 'property-1',
        tenantId: 'tenant-1',
        guarantorId: 'guarantor-1',
      });

      expect(invoiceDrafts).toHaveLength(3);
      expect(invoiceDrafts[0]).toEqual({
        type: 'RENT',
        description: 'Aluguel 1/2026',
        amount: 1500,
        dueDate: new Date(2026, 0, 5),
        status: 'PENDING',
        propertyId: 'property-1',
      });

      expect(invoiceDrafts[1]).toEqual({
        type: 'RENT',
        description: 'Aluguel 2/2026',
        amount: 1500,
        dueDate: new Date(2026, 1, 5),
        status: 'PENDING',
        propertyId: 'property-1',
      });

      expect(invoiceDrafts[2]).toEqual({
        type: 'RENT',
        description: 'Aluguel 3/2026',
        amount: 1500,
        dueDate: new Date(2026, 2, 5),
        status: 'PENDING',
        propertyId: 'property-1',
      });

      expect(result).toEqual(createdLease);
    });

    it('pushes first due date to next month when due day is before lease start date', async () => {
      leaseRepo.createWithInitialInvoices.mockResolvedValue(makeLease());

      await service.create({
        startDate: '2026-01-20T00:00:00.000Z',
        endDate: '2026-03-31T00:00:00.000Z',
        rentValue: 1500,
        rentDueDay: 5,
        propertyId: 'property-1',
        tenantId: 'tenant-1',
      } as any);

      const [, invoiceDrafts] = leaseRepo.createWithInitialInvoices.mock.calls[0];

      expect(invoiceDrafts[0].dueDate).toEqual(new Date(2026, 1, 5));
    });
  });

  describe('findAll', () => {
    it('marks expired non-auto-renew leases as inactive', async () => {
      const expiredLease = makeLease({
        id: 'lease-expired',
        endDate: new Date('2026-03-01T00:00:00.000Z'),
        isActive: true,
        autoRenew: false,
      });

      leaseRepo.findAll.mockResolvedValue([expiredLease]);
      leaseRepo.markInactive.mockResolvedValue({ ...expiredLease, isActive: false });

      const result = await service.findAll();

      expect(leaseRepo.markInactive).toHaveBeenCalledWith('lease-expired');
      expect(expiredLease.isActive).toBe(false);
      expect(result).toEqual([expiredLease]);
    });

    it('auto-renews expired auto-renew leases', async () => {
      const expiredLease = makeLease({
        id: 'lease-renew',
        endDate: new Date('2026-03-01T00:00:00.000Z'),
        isActive: true,
        autoRenew: true,
        notes: 'original',
      });

      leaseRepo.findAll.mockResolvedValue([expiredLease]);
      leaseRepo.renewById.mockResolvedValue(expiredLease);

      await service.findAll();

      expect(leaseRepo.renewById).toHaveBeenCalledTimes(1);

      const [leaseId, newEndDate, notes] = leaseRepo.renewById.mock.calls[0];

      expect(leaseId).toBe('lease-renew');
      expect(newEndDate).toEqual(new Date('2027-03-01T00:00:00.000Z'));
      expect(notes).toContain('[System] Auto-renewed');
    });
  });

  describe('findOne', () => {
    it('returns null when lease is not found', async () => {
      leaseRepo.findById.mockResolvedValue(null);

      const result = await service.findOne('missing-id');

      expect(result).toBeNull();
      expect(leaseRepo.markInactive).not.toHaveBeenCalled();
      expect(leaseRepo.renewById).not.toHaveBeenCalled();
    });

    it('checks expiration for a found lease', async () => {
      const expiredLease = makeLease({
        id: 'lease-expired',
        endDate: new Date('2026-03-01T00:00:00.000Z'),
        isActive: true,
        autoRenew: false,
      });

      leaseRepo.findById.mockResolvedValue(expiredLease);
      leaseRepo.markInactive.mockResolvedValue({ ...expiredLease, isActive: false });

      const result = await service.findOne('lease-expired');

      expect(leaseRepo.markInactive).toHaveBeenCalledWith('lease-expired');
      expect(result).toEqual(expiredLease);
    });
  });

  describe('update', () => {
    it('delegates to repository', async () => {
      const updatedLease = makeLease({ notes: 'updated' });
      leaseRepo.updateById.mockResolvedValue(updatedLease);

      const result = await service.update('lease-1', { notes: 'updated' });

      expect(leaseRepo.updateById).toHaveBeenCalledWith('lease-1', {
        notes: 'updated',
      });
      expect(result).toEqual(updatedLease);
    });
  });
});