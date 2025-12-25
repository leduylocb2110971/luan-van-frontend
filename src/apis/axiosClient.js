import axios from "axios";
import { store } from "../../src/redux/store" // nơi chứa store Redux
import * as AuthService from "../services/AuthService"; // nơi chứa các hàm gọi API
import { logout, setUser } from "../redux/slice/authSlice";
const axiosClient = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true, // để gửi cookie lên nếu dùng HttpOnly
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// Add access_token từ Redux
axiosClient.interceptors.request.use(
    (config) => {
        const accessToken = store.getState().auth?.user?.access_token;
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Xử lý khi token hết hạn (401)
axiosClient.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;
        if (
            error.response?.data.message === "Xác thực người dùng thất bại: jwt expired" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosClient(originalRequest);
                });
            }
            isRefreshing = true;
            try {
                const res = await AuthService.refreshToken();
                if (res?.status === "error") {
                    store.dispatch(logout());
                    return Promise.reject(res);
                } else if (res?.status === "success") {
                    const user = store.getState().auth.user;
                    const newAccessToken = res.data.accessToken;
                    store.dispatch(
                        setUser({ ...user, access_token: newAccessToken }),
                    );
                    axiosClient.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
                    processQueue(null, newAccessToken);
                    return axiosClient(originalRequest);
                }
            } catch (err) {
                processQueue(err, null);
                store.dispatch(logout());
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    },
);
export default axiosClient;