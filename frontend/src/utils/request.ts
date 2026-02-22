import axios from 'axios';

const request = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

// ─── 请求拦截器：自动附加 Bearer Token ───
request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// ─── 响应拦截器：统一解包 & 401 处理 ───
request.interceptors.response.use(
    (response) => {
        const res = response.data;
        // 后端统一响应格式 { code, message, data, timestamp }
        if (res.code !== 200) {
            // 非 200 业务码，抛出错误
            return Promise.reject(new Error(res.message || '请求失败'));
        }
        return res; // 返回整个 { code, message, data }
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token 过期或无效 → 清除本地状态 → 跳到登录页
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    },
);

export default request;
