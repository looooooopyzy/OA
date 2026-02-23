import request from './request';

export interface UserItem {
    id: number;
    username: string;
    email: string | null;
    phone: string | null;
    real_name: string | null;
    avatar: string | null;
    is_active: boolean;
    department_id: number | null;
    department_name: string | null;
    roles: { id: number; name: string; code: string }[];
    created_at: string;
}

export interface UserPageData {
    items: UserItem[];
    total: number;
    page: number;
    page_size: number;
}

export function getUserListApi(params: { page: number; page_size: number; keyword?: string; department_id?: number }) {
    return request.get<any, { code: number; message: string; data: UserPageData }>('/api/v1/users', { params });
}

export function createUserApi(data: any) {
    return request.post('/api/v1/users', data);
}

export function updateUserApi(id: number, data: any) {
    return request.put(`/api/v1/users/${id}`, data);
}

export function deleteUserApi(id: number) {
    return request.delete(`/api/v1/users/${id}`);
}
