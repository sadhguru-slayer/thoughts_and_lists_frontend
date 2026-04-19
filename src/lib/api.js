import axios from 'axios';
import Cookies from 'js-cookie';

const baseURL =
    process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_BACKEND_URL
        : 'http://127.0.0.1:8000';

const api = axios.create({ baseURL });

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = typeof window !== 'undefined' ? Cookies.get('access_token') : null;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add a response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = typeof window !== 'undefined' ? Cookies.get('refresh_token') : null;

            if (!refreshToken) {
                isRefreshing = false;
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('auth-unauthorized'));
                }
                return Promise.reject(error);
            }

            try {
                // Fetch new tokens utilizing out-of-band axios request to prevent loops
                const res = await axios.post(`${baseURL}/api/v1/auth/refresh-token`, null, {
                    headers: {
                        'Refresh-Token': refreshToken
                    }
                });

                const newAccessToken = res.data.access_token;
                const newRefreshToken = res.data.refresh_token;

                Cookies.set('access_token', newAccessToken, { expires: 7, path: '/', sameSite: 'Lax' });
                Cookies.set('refresh_token', newRefreshToken, { expires: 7, path: '/', sameSite: 'Lax' });

                isRefreshing = false;
                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (err) {
                isRefreshing = false;
                processQueue(err, null);
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('auth-unauthorized'));
                }
                return Promise.reject(err);
            }
        }

        if (error.response && error.response.status === 401 && originalRequest._retry) {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new Event('auth-unauthorized'));
            }
        }

        return Promise.reject(error);
    }
);

export default api;
