import api from '../api/axios';

export interface Client {
    id: number;
    fullName: string;
    email: string;
    tier: 'BASIC' | 'SILVER' | 'GOLD' | 'PLATINUM';
    totalSpent: number;
    totalOrders: number;
    firstOrderDate: string | null;
    lastOrderDate: string | null;
}

export interface CreateClientRequest {
    fullName: string;
    email: string;
    password: string;
}

export interface UpdateClientRequest {
    fullName: string;
    email: string;
}

export interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

export interface Order {
    id: number;
    clientName: string;
    items: OrderItem[];
    subTotal: number;
    totalDiscount: number;
    tax: number;
    totalAmount: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'REJECTED';
    paymentStatus: 'EN_ATTENTE' | 'ENCAISSE' | 'REJETE';
}

export const clientService = {
    getAll: async (): Promise<Client[]> => {
        const response = await api.get<Client[]>('/clients');
        return response.data;
    },

    getById: async (id: number): Promise<Client> => {
        const response = await api.get<Client>(`/clients/${id}`);
        return response.data;
    },

    create: async (clientData: CreateClientRequest): Promise<Client> => {
        const response = await api.post<Client>('/clients', clientData);
        return response.data;
    },

    update: async (id: number, clientData: UpdateClientRequest): Promise<Client> => {
        const response = await api.put<Client>(`/clients/${id}`, clientData);
        return response.data;
    },

    getOrderHistory: async (id: number): Promise<Order[]> => {
        const response = await api.get<Order[]>(`/clients/${id}/orders`);
        return response.data;
    },
};
