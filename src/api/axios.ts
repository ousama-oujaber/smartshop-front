import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    if (import.meta.env.DEV) {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            
        }
        return Promise.reject(error);
    }
);

export default api;
