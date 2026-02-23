import request from './request';

export interface DepartmentItem {
    id: number;
    name: string;
    parent_id: number | null;
    sort_order: number;
    leader_id: number | null;
    created_at: string;
    children: DepartmentItem[];
}

export function getDepartmentTreeApi() {
    return request.get<any, { code: number; message: string; data: DepartmentItem[] }>('/api/v1/departments/tree');
}

export function createDepartmentApi(data: any) {
    return request.post('/api/v1/departments', data);
}

export function updateDepartmentApi(id: number, data: any) {
    return request.put(`/api/v1/departments/${id}`, data);
}

export function deleteDepartmentApi(id: number) {
    return request.delete(`/api/v1/departments/${id}`);
}
