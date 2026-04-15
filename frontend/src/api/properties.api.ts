import { API_URL } from './client.api';

export const propertiesApi = {
    findAll: async () => {
        const res = await fetch(`${API_URL}/properties`);
        if (!res.ok) throw new Error('Failed to fetch properties');
        return res.json();
    },

    findOne: async (id: string, token: string) => {
        const res = await fetch(`${API_URL}/properties/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch property');
        return res.json();
    },

    create: async (data: any, token: string) => {
        const res = await fetch(`${API_URL}/properties`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create property');
        return res.json();
    },

    addExpense: async (id: string, data: any, token: string) => {
        const res = await fetch(`${API_URL}/properties/${id}/expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to add expense');
        return res.json();
    },

    addPropertyExpense: async (id: string, data: any, token: string) => {
        const res = await fetch(`${API_URL}/properties/${id}/property-expenses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to add property expense');
        return res.json();
    },

    removePropertyExpense: async (entryId: string, token: string) => {
        const res = await fetch(`${API_URL}/properties/property-expenses/${entryId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to remove property expense');
        return res.json();
    },

    update: async (id: string, data: any, token: string) => {
        const res = await fetch(`${API_URL}/properties/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to update property');
        return res.json();
    },

    delete: async (id: string, token: string) => {
        const res = await fetch(`${API_URL}/properties/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to delete property');
        return res.json();
    },

    uploadPhotos: async (id: string, files: FileList, token: string) => {
        const formData = new FormData();
        Array.from(files).forEach((file) => formData.append('files', file));

        const res = await fetch(`${API_URL}/properties/${id}/photos`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        if (!res.ok) throw new Error('Failed to upload photos');
        return res.json();
    },

    uploadDocument: async (id: string, file: File, title: string, token: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);

        const res = await fetch(`${API_URL}/properties/${id}/documents`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
        });
        if (!res.ok) throw new Error('Failed to upload document');
        return res.json();
    },

    addNote: async (id: string, content: string, token: string) => {
        const res = await fetch(`${API_URL}/properties/${id}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
        });
        if (!res.ok) throw new Error('Failed to add note');
        return res.json();
    },
};