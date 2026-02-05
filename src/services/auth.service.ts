import api from '../api/axios';

export interface LoginRequest {
    username: string;
    password: string;
}

export interface User {
    id: number;
    username: string;
    role: 'ADMIN' | 'CLIENT';
}

export interface AuthResponse {
    message: string;
    username: string;
    role: 'ADMIN' | 'CLIENT';
}

export const authService = {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login', credentials);
        return response.data;
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout');
    },

    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<User>('/auth/me');
        return response.data;
    },
};
