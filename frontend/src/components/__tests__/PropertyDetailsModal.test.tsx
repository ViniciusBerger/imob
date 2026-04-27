import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import PropertyDetailsModal from '../PropertyDetailsModal';

const mocks = vi.hoisted(() => ({
    findOne: vi.fn(),
    update: vi.fn(),
    deleteProperty: vi.fn(),
    addNote: vi.fn(),
    uploadDocument: vi.fn(),
    removePropertyExpense: vi.fn(),
    addPropertyExpense: vi.fn(),
    maintenanceCreate: vi.fn(),
    maintenanceComplete: vi.fn(),
    updateInvoice: vi.fn(),
}));

vi.mock('../../api', () => ({
    api: {
        properties: {
            findOne: mocks.findOne,
            update: mocks.update,
            delete: mocks.deleteProperty,
            addNote: mocks.addNote,
            uploadDocument: mocks.uploadDocument,
            removePropertyExpense: mocks.removePropertyExpense,
            addPropertyExpense: mocks.addPropertyExpense,
        },
        maintenance: {
            create: mocks.maintenanceCreate,
            complete: mocks.maintenanceComplete,
        },
        finance: {
            updateInvoice: mocks.updateInvoice,
        },
    },
}));

function makeProperty(overrides: Record<string, any> = {}) {
    return {
        id: 'property-1',
        code: 'PROP-001',
        nickname: 'Apartamento Centro',
        address: '123 Main St',
        city: 'Calgary',
        state: 'AB',
        builtArea: '',
        landArea: '',
        bedrooms: '',
        bathrooms: '',
        garage: '',
        rentPrice: '',
        salePrice: '',
        purchasePrice: '',
        purchaseDate: '',
        financingType: '',
        financingEndDate: '',
        installmentValue: '',
        financingTotalValue: '',
        installmentsCount: '',
        installmentsPaid: '',
        correctionIndex: '',
        photos: [],
        notes: [],
        propertyExpenses: [],
        documents: [],
        maintenances: [],
        leases: [],
        ...overrides,
    };
}

describe('PropertyDetailsModal', () => {
    const onClose = vi.fn();
    const onUpdate = vi.fn();
    const token = 'token-123';
    const propertyId = 'property-1';

    beforeEach(() => {
        vi.clearAllMocks();

        sessionStorage.clear();
        sessionStorage.setItem(
            'user',
            JSON.stringify({
                id: 'user-1',
                name: 'Test User',
            }),
        );

        Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
            configurable: true,
            value: vi.fn(),
        });

        vi.stubGlobal('alert', vi.fn());
        vi.stubGlobal('confirm', vi.fn(() => true));

        mocks.findOne.mockResolvedValue(makeProperty());
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    function renderModal() {
        return render(
            <PropertyDetailsModal
                propertyId={propertyId}
                onClose={onClose}
                token={token}
                onUpdate={onUpdate}
            />,
        );
    }

    it('loads property data on mount', async () => {
        renderModal();

        expect(mocks.findOne).toHaveBeenCalledWith(propertyId, token);

        expect(await screen.findByText('Apartamento Centro')).toBeInTheDocument();
        expect(screen.getByText('#PROP-001')).toBeInTheDocument();
    });

    it('adds a note using the new api contract and refreshes the property', async () => {
        const initialProperty = makeProperty({
            notes: [],
        });

        const refreshedProperty = makeProperty({
            notes: [
                {
                    id: 'note-1',
                    content: 'Nova observação',
                    userId: 'user-1',
                    createdAt: '2026-04-21T12:00:00.000Z',
                },
            ],
        });

        mocks.findOne
            .mockResolvedValueOnce(initialProperty)
            .mockResolvedValueOnce(refreshedProperty);

        mocks.addNote.mockResolvedValue({ id: 'note-1' });

        renderModal();

        const input = await screen.findByPlaceholderText('Digite uma mensagem...');
        await userEvent.type(input, 'Nova observação{enter}');

        await waitFor(() => {
            expect(mocks.addNote).toHaveBeenCalledWith(
                propertyId,
                'Nova observação',
                token,
            );
        });

        await waitFor(() => {
            expect(mocks.findOne).toHaveBeenCalledTimes(2);
        });

        expect(input).toHaveValue('');
        expect(await screen.findByText('Nova observação')).toBeInTheDocument();
    });

    it('does not add an empty note', async () => {
        renderModal();

        const input = await screen.findByPlaceholderText('Digite uma mensagem...');
        await userEvent.type(input, '   {enter}');

        expect(mocks.addNote).not.toHaveBeenCalled();
    });

    it('deletes the property when confirmed', async () => {
        mocks.deleteProperty.mockResolvedValue({});

        renderModal();

        await screen.findByText('Apartamento Centro');

        await userEvent.click(screen.getByRole('button', { name: /config/i }));
        await userEvent.click(screen.getByRole('button', { name: /excluir imóvel/i }));

        await waitFor(() => {
            expect(mocks.deleteProperty).toHaveBeenCalledWith(propertyId, token);
        });

        expect(onUpdate).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not delete the property when confirmation is cancelled', async () => {
        vi.stubGlobal('confirm', vi.fn(() => false));

        renderModal();

        await screen.findByText('Apartamento Centro');

        await userEvent.click(screen.getByRole('button', { name: /config/i }));
        await userEvent.click(screen.getByRole('button', { name: /excluir imóvel/i }));

        expect(mocks.deleteProperty).not.toHaveBeenCalled();
        expect(onUpdate).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('uploads a document and refreshes the property', async () => {
        const initialProperty = makeProperty({
            documents: [],
        });

        const refreshedProperty = makeProperty({
            documents: [
                {
                    id: 'doc-1',
                    title: 'contrato.pdf',
                    filePath: '/uploads/contrato.pdf',
                    createdAt: '2026-04-21T12:00:00.000Z',
                },
            ],
        });

        mocks.findOne
            .mockResolvedValueOnce(initialProperty)
            .mockResolvedValueOnce(refreshedProperty);

        mocks.uploadDocument.mockResolvedValue({ id: 'doc-1' });

        const { container } = renderModal();

        await screen.findByText('Apartamento Centro');

        await userEvent.click(screen.getByRole('button', { name: /documentos/i }));

        const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
        expect(fileInput).toBeTruthy();

        const file = new File(['dummy content'], 'contrato.pdf', {
            type: 'application/pdf',
        });

        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(mocks.uploadDocument).toHaveBeenCalledWith(
                propertyId,
                file,
                'contrato.pdf',
                token,
            );
        });

        await waitFor(() => {
            expect(mocks.findOne).toHaveBeenCalledTimes(2);
        });

        expect(await screen.findByText('contrato.pdf')).toBeInTheDocument();
    });
});