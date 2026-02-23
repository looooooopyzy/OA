import request from './request';

export interface RoleItem {
    id: number;
    name: string;
    code: string;
    description: string | null;
    data_scope: string;
    departments?: { id: number; name: string }[];
    created_at: string;
}

export interface RolePageData {
    items: RoleItem[];
    total: number;
    page: number;
    page_size: number;
}

export function getRoleListApi(params: { page: number; page_size: number; keyword?: string }) {
    return request.get<any, { code: number; message: string; data: RolePageData }>('/api/v1/roles', { params });
}

export function getRoleDetailApi(id: number) {
    return request.get<any, { code: number; message: string; data: any }>(`/api/v1/roles/${id}`);
}

export function createRoleApi(data: any) {
    return request.post('/api/v1/roles', data);
}

export function updateRoleApi(id: number, data: any) {
    return request.put(`/api/v1/roles/${id}`, data);
}

export function deleteRoleApi(id: number) {
    return request.delete(`/api/v1/roles/${id}`);
}
