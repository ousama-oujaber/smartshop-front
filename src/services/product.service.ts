import api from '../api/axios';

export interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
}

export interface CreateProductRequest {
    name: string;
    price: number;
    stock: number;
}

export interface UpdateProductRequest {
    name: string;
    price: number;
    stock: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    pageable: {
        pageNumber: number;
        pageSize: number;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    size: number;
    number: number;
    sort: {
        sorted: boolean;
        unsorted: boolean;
    };
    numberOfElements: number;
    empty: boolean;
}

export const productService = {
    getAll: async (includeDeleted = false): Promise<Product[]> => {
        const response = await api.get<Product[]>(`/products?includeDeleted=${includeDeleted}`);
        return response.data;
    },

    getPaginated: async (
        page = 0,
        size = 10,
        sortBy = 'id',
        sortDir = 'asc',
        includeDeleted = false
    ): Promise<PaginatedResponse<Product>> => {
        const response = await api.get<PaginatedResponse<Product>>(
            `/products/page?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}&includeDeleted=${includeDeleted}`
        );
        return response.data;
    },

    getById: async (id: number): Promise<Product> => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },

    create: async (productData: CreateProductRequest): Promise<Product> => {
        const response = await api.post<Product>('/products', productData);
        return response.data;
    },

    update: async (id: number, productData: UpdateProductRequest): Promise<Product> => {
        const response = await api.put<Product>(`/products/${id}`, productData);
        return response.data;
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/products/${id}`);
    },

    restore: async (id: number): Promise<void> => {
        await api.put(`/products/${id}/restore`);
    },
};
