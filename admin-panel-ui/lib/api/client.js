/**
 * Central API client — uses axios instead of fetch.
 *
 * BASE_URL  → NEXT_PUBLIC_API_URL or http://localhost:4000/api
 * Token     → read from Zustand persist store (key: "auth-store")
 */
import axios from 'axios';
import { useAuthStore } from '@/lib/store/auth-store';
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
// ─── Shared axios instance ────────────────────────────────────────────────────
export const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 2000 * 60, // 2 minute
});
// ─── Response interceptor — handle 401 Unauthorized (expired / invalid token) ─
axiosInstance.interceptors.response.use((response) => response, async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && typeof window !== 'undefined') {
        const isAuthRoute = originalRequest.url?.includes('/auth/login') ||
                            originalRequest.url?.includes('/auth/forgot-password') ||
                            originalRequest.url?.includes('/auth/reset-password');
        if (isAuthRoute) {
            return Promise.reject(error);
        }
        originalRequest._retry = true;
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                refreshQueue.push({
                    resolve: (token) => {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        resolve(axiosInstance(originalRequest));
                    },
                    reject,
                });
            });
        }
        isRefreshing = true;
        try {
            const newToken = await doRefresh();
            refreshQueue.forEach((cb) => cb.resolve(newToken));
            refreshQueue = [];
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
        }
        catch (err) {
            refreshQueue.forEach((cb) => cb.reject(err instanceof Error ? err : new Error('Refresh failed')));
            refreshQueue = [];
            clearAuth();
        }
        finally {
            isRefreshing = false;
        }
    }
    return Promise.reject(error);
});
// ─── Request interceptor — attach token ───────────────────────────────────────
axiosInstance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
// ─── Custom error class ───────────────────────────────────────────────────────
export class ApiError extends Error {
    constructor(status, message, data) {
        super(message);
        this.status = status;
        this.data = data;
        this.name = 'ApiError';
    }
}
// ─── Token helper ─────────────────────────────────────────────────────────────
function getToken() {
    if (typeof window === 'undefined')
        return null;
    try {
        const raw = localStorage.getItem('auth-store');
        if (!raw)
            return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.token ?? null;
    }
    catch {
        return null;
    }
}
function getRefreshToken() {
    // Refresh token is stored in an httpOnly cookie — the browser sends it
    // automatically; no JS read needed. This function is intentionally empty.
    return null;
}
function setToken(token) {
    if (typeof window === 'undefined')
        return;
    try {
        useAuthStore.setState({ token });
        const raw = localStorage.getItem('auth-store');
        if (!raw) {
            localStorage.setItem('auth-store', JSON.stringify({ state: { token } }));
            return;
        }
        const parsed = JSON.parse(raw);
        if (parsed?.state) {
            parsed.state.token = token;
            // Remove any stale refreshToken that may have been stored previously
            delete parsed.state.refreshToken;
            localStorage.setItem('auth-store', JSON.stringify(parsed));
        }
        else {
            localStorage.setItem('auth-store', JSON.stringify({ state: { token } }));
        }
    }
    catch {
        // ignore
    }
}
function clearAuth() {
    if (typeof window === 'undefined')
        return;
    try {
        const raw = localStorage.getItem('auth-store');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.state) {
                parsed.state.token = null;
                delete parsed.state.refreshToken;
                localStorage.setItem('auth-store', JSON.stringify(parsed));
            }
        }
    }
    catch {
        localStorage.removeItem('auth-store');
    }
    // Clear the httpOnly refresh-token cookie via the server logout endpoint
    fetch('/api/v1/admin/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    window.location.href = '/login';
}
let isRefreshing = false;
let refreshQueue = [];
async function doRefresh() {
    // The refresh token lives in an httpOnly cookie; send it with credentials.
    // Do NOT read it from localStorage.
    const res = await axios.post(
        `${BASE_URL}/api/v1/admin/auth/refresh`,
        {},
        { timeout: 120000, withCredentials: true }
    );
    const data = res.data?.data;
    if (!data?.token)
        throw new Error('Refresh failed');
    setToken(data.token);
    return data.token;
}
// ─── Response normaliser ──────────────────────────────────────────────────────
function handleError(err) {
    if (axios.isAxiosError(err)) {
        const axiosErr = err;
        const status = axiosErr.response?.status ?? 0;
        const message = axiosErr.response?.data?.message ||
            axiosErr.message ||
            `Request failed with status ${status}`;
        throw new ApiError(status, message, axiosErr.response?.data);
    }
    throw err;
}
// ─── Typed request wrappers ───────────────────────────────────────────────────
async function request(method, endpoint, data, config) {
    try {
        const isFormData = data instanceof FormData;
        const res = await axiosInstance.request({
            method,
            url: endpoint,
            data,
            ...config,
            headers: {
                // Let axios set Content-Type automatically for FormData (includes boundary)
                ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
                ...config?.headers,
            },
        });
        return res.data;
    }
    catch (err) {
        handleError(err);
    }
}
export const apiClient = {
    get: (endpoint, config) =>
    request('get', endpoint, undefined, config),

  post: (endpoint, body, config) =>
    request('post', endpoint, body, config),

  put: (endpoint, body, config) =>
    request('put', endpoint, body, config),

  patch: (endpoint, body, config) =>
    request('patch', endpoint, body, config),

  // body is optional — DELETE can carry a payload (e.g. bulk-delete with IDs)
  delete: (endpoint, body, config) =>
    request('delete', endpoint, body, config),
};
