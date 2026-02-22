import { create } from 'zustand';
import { loginApi, getUserInfoApi, type UserInfo } from '@/utils/api';

interface AuthState {
    /** 当前登录用户信息 */
    user: UserInfo | null;
    /** 是否已经完成初始化检查 */
    initialized: boolean;
    /** 是否正在加载 */
    loading: boolean;

    /** 登录 */
    login: (username: string, password: string) => Promise<void>;
    /** 获取当前用户信息 */
    fetchUser: () => Promise<void>;
    /** 登出 */
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    initialized: false,
    loading: false,

    login: async (username, password) => {
        set({ loading: true });
        try {
            const res = await loginApi(username, password);
            localStorage.setItem('access_token', res.data.access_token);
            localStorage.setItem('refresh_token', res.data.refresh_token);
            // 登录成功后立即拉取用户信息
            const userRes = await getUserInfoApi();
            set({ user: userRes.data, initialized: true });
        } finally {
            set({ loading: false });
        }
    },

    fetchUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            set({ initialized: true });
            return;
        }
        try {
            const res = await getUserInfoApi();
            set({ user: res.data, initialized: true });
        } catch {
            // Token 无效，清理
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({ user: null, initialized: true });
        }
    },

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null });
        window.location.href = '/login';
    },
}));
