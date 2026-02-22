import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Spin } from 'antd';

/**
 * 路由守卫：仅允许已登录用户访问子路由。
 * 未登录则重定向到 /login。
 */
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, initialized } = useAuthStore();
    const location = useLocation();

    if (!initialized) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <Spin size="large" tip="加载中..." />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default AuthGuard;
