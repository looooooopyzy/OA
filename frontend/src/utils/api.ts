import request from './request';

/** 后端统一响应体 */
export interface ApiResponse<T = any> {
    code: number;
    message: string;
    data: T;
    timestamp: string;
}

/** Token 对 */
export interface TokenPayload {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

/** 用户信息（/auth/me 返回） */
export interface UserInfo {
    id: number;
    username: string;
    real_name: string | null;
    avatar: string | null;
    roles: string[];
    permissions: string[];
    menus: any[];
}

/** 登录 */
export function loginApi(username: string, password: string) {
    return request.post<any, ApiResponse<TokenPayload>>('/api/v1/auth/login', {
        username,
        password,
    });
}

/** 获取当前用户信息 */
export function getUserInfoApi() {
    return request.get<any, ApiResponse<UserInfo>>('/api/v1/auth/me');
}

/** 刷新 Token */
export function refreshTokenApi(refresh_token: string) {
    return request.post<any, ApiResponse<TokenPayload>>('/api/v1/auth/refresh', {
        refresh_token,
    });
}
