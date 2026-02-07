import api from '../api/axios';

export interface OrderItemRequest {
    productId: number;
    quantity: number;
}

export interface CreateOrderRequest {
    clientId: number;
    items: OrderItemRequest[];
    promoCode?: string;
}

export interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELED' | 'REJECTED';
export type PaymentStatus = 'EN_ATTENTE' | 'ENCAISSE' | 'REJETE';

export interface Order {
    id: number;
    clientName: string;
    items: OrderItem[];
    subTotal: number;
    totalDiscount: number;
    tax: number;
    totalAmount: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
}

export const orderService = {
    getAll: async (clientId?: number): Promise<Order[]> => {
        const url = clientId ? `/orders?clientId=${clientId}` : '/orders';
        const response = await api.get<Order[]>(url);
        return response.data;
    },

    getById: async (id: number): Promise<Order> => {
        const response = await api.get<Order>(`/orders/${id}`);
        return response.data;
    },

    create: async (orderData: CreateOrderRequest): Promise<Order> => {
        const response = await api.post<Order>('/orders', orderData);
        return response.data;
    },

    confirm: async (id: number): Promise<Order> => {
        const response = await api.put<Order>(`/orders/${id}/validate`);
        return response.data;
    },

    cancel: async (id: number): Promise<Order> => {
        const response = await api.put<Order>(`/orders/${id}/cancel`);
        return response.data;
    },
};
