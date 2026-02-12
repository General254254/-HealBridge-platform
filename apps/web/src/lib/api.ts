import axios from 'axios';
import { useAuthStore } from '../store/auth.store';

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL as string) || '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — attach JWT
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor — handle 401 and refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = useAuthStore.getState().refreshToken;

            if (refreshToken) {
                try {
                    const { data } = await api.post('/auth/refresh-token', { refreshToken });
                    useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                    return api(originalRequest);
                } catch {
                    useAuthStore.getState().logout();
                }
            }
        }

        return Promise.reject(error);
    },
);

export default api;
