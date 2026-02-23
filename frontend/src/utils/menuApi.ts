import request from './request';

export interface MenuItem {
    id: number;
    name: string;
    path: string | null;
    icon: string | null;
    parent_id: number | null;
    sort_order: number;
    is_visible: boolean;
    permission_code: string | null;
    plugin_id: string | null;
    menu_type: 'directory' | 'menu' | 'button';
    children?: MenuItem[];
    created_at: string;
}

export function getMenuTreeApi() {
    return request.get<any, { code: number; message: string; data: MenuItem[] }>('/api/v1/menus/tree');
}

export function createMenuApi(data: Partial<MenuItem>) {
    return request.post('/api/v1/menus', data);
}

export function updateMenuApi(id: number, data: Partial<MenuItem>) {
    return request.put(`/api/v1/menus/${id}`, data);
}

export function deleteMenuApi(id: number) {
    return request.delete(`/api/v1/menus/${id}`);
}
