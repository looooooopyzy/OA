import React from 'react';
import * as AntIcons from '@ant-design/icons';
import {
    LayoutDashboard,
    Bell,
    Settings,
    Key,
    ShieldAlert,
    Network,
    Users,
    Grid,
    List,
    Edit,
    Package
} from 'lucide-react';

export function renderIcon(iconName: string, size: number = 18) {
    if (!iconName) return <Package size={size} />;

    const lucideMap: Record<string, React.ReactNode> = {
        'DashboardOutlined': <LayoutDashboard size={size} />,
        'SettingOutlined': <Settings size={size} />,
        'UserOutlined': <Users size={size} />,
        'TeamOutlined': <ShieldAlert size={size} />,
        'ApartmentOutlined': <Network size={size} />,
        'MenuOutlined': <Key size={size} />,
        'AppstoreOutlined': <Grid size={size} />,
        'NotificationOutlined': <Bell size={size} />,
        'EditOutlined': <Edit size={size} />,
        'UnorderedListOutlined': <List size={size} />,
    };

    if (lucideMap[iconName]) return lucideMap[iconName];

    const AntIcon = (AntIcons as any)[iconName];
    return AntIcon ? <AntIcon style={{ fontSize: size }} /> : <Package size={size} />;
}

export function buildMenuTree(flatMenus: any[]): any[] {
    const map = new Map();
    const roots: any[] = [];

    // 初始化 map
    flatMenus.forEach((menu) => {
        map.set(menu.id, {
            ...menu,
            key: menu.path || `dir_${menu.id}`,
            label: menu.name,
            icon: renderIcon(menu.icon),
            children: []
        });
    });

    // 构建树
    flatMenus.forEach((menu) => {
        const node = map.get(menu.id);
        if (menu.parent_id) {
            const parent = map.get(menu.parent_id);
            if (parent) {
                parent.children.push(node);
            } else {
                roots.push(node);
            }
        } else {
            roots.push(node);
        }
    });

    // 递归排序并处理 children 空数组
    const sortNodes = (nodes: any[], depth = 0) => {
        nodes.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        nodes.forEach(node => {
            if (node.children.length > 0) {
                sortNodes(node.children, depth + 1);
                // 对顶级目录使用 Ant Design 分组样式
                if (node.menu_type === 'directory' && depth === 0) {
                    node.type = 'group';
                }
            } else {
                delete node.children;
            }
        });
    };

    sortNodes(roots);
    return roots;
}
