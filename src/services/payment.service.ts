import api from '../api/axios';

export type PaymentMethod = 'ESPECES' | 'CHEQUE' | 'VIREMENT';
export type PaymentStatus = 'EN_ATTENTE' | 'ENCAISSE' | 'REJETE';

export interface OrderSummary {
    id: number;
    totalAmount: number;
    remainingAmount: number;
}

export interface Payment {
    id: number;
    order: OrderSummary;
    paymentNumber: number;
    amount: number;
    paymentDate: string;
    encashmentDate: string | null;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    reference: string;
    bank: string;
    chequeNumber: string;
    dueDate: string;
}

export interface CreatePaymentRequest {
    orderId: number;
    amount: number;
    paymentMethod: PaymentMethod;
    reference: string;
    bank?: string;
    chequeNumber?: string;
    dueDate?: string;
}

export const paymentService = {
    getById: async (id: number): Promise<Payment> => {
        const response = await api.get<Payment>(`/payments/${id}`);
        return response.data;
    },

    getByOrderId: async (orderId: number): Promise<Payment[]> => {
        const response = await api.get<Payment[]>(`/payments/order/${orderId}`);
        return response.data;
    },

    create: async (paymentData: CreatePaymentRequest): Promise<Payment> => {
        const response = await api.post<Payment>('/payments', paymentData);
        return response.data;
    },

    encash: async (id: number): Promise<Payment> => {
        const response = await api.put<Payment>(`/payments/${id}/encash`);
        return response.data;
    },

    reject: async (id: number): Promise<Payment> => {
        const response = await api.put<Payment>(`/payments/${id}/reject`);
        return response.data;
    },
};
