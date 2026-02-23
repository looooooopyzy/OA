import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, Switch, Select, message, Popconfirm, Tag, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FolderOutlined, MenuOutlined, AppstoreOutlined } from '@ant-design/icons';
import { getMenuTreeApi, createMenuApi, updateMenuApi, deleteMenuApi } from '@/utils/menuApi';
import type { MenuItem } from '@/utils/menuApi';

/* ─────────── 预设的通用操作动作 ─────────── */
const COMMON_ACTIONS = [
    { label: '🔍 查看列表', value: 'view' },
    { label: '➕ 新增', value: 'add' },
    { label: '✏️ 编辑', value: 'edit' },
    { label: '🗑️ 删除', value: 'delete' },
    { label: '📥 导入', value: 'import' },
    { label: '📤 导出', value: 'export' },
    { label: '✅ 审批', value: 'approve' },
    { label: '📎 上传附件', value: 'upload' },
];

/**
 * 根据父菜单路径和动作自动生成权限标识
 * 例如：父菜单 path = "/system/users" + action = "add"  →  "system:users:add"
 */
const buildPermCode = (parentPath: string | null | undefined, action: string) => {
    if (!parentPath) return action;
    // "/system/users" → "system:users"
    const segments = parentPath.replace(/^\//, '').replace(/\//g, ':');
    return `${segments}:${action}`;
};

/**
 * 从路由路径自动生成菜单级别的权限标识
 * 例如: "/system/users" → "system:users:view"
 */
const buildMenuPermFromPath = (path: string | null | undefined) => {
    if (!path) return '';
    const segments = path.replace(/^\//, '').replace(/\//g, ':');
    return `${segments}:view`;
};

/** 在树中查找某个节点 */
const findNodeById = (tree: MenuItem[], id: number | null): MenuItem | null => {
    if (!id) return null;
    for (const node of tree) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

const MenuManagement: React.FC = () => {
    const [menus, setMenus] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
    const [form] = Form.useForm();
    const [saveLoading, setSaveLoading] = useState(false);

    // 动态监听表单字段
    const watchMenuType = Form.useWatch('menu_type', form);
    const watchParentId = Form.useWatch('parent_id', form);
    const watchSlug = Form.useWatch('_slug', form);
    const watchAction = Form.useWatch('_action', form);

    /** 获取父节点的完整路径 */
    const getParentPath = (parentId: number | null | undefined): string => {
        const parent = findNodeById(menus, parentId ?? null);
        return parent?.path || '';
    };

    /** 实时拼接完整路由路径 */
    const computedFullPath = (() => {
        if (watchMenuType === 'button') return null;
        const parentPath = getParentPath(watchParentId);
        const slug = (watchSlug || '').replace(/^\/+/, '').replace(/\/+$/, '');
        if (!slug) return parentPath ? `${parentPath}/???` : '/???';
        if (parentPath) return `${parentPath}/${slug}`;
        return `/${slug}`;
    })();

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        setLoading(true);
        try {
            const res = await getMenuTreeApi();
            setMenus(res.data || []);
        } catch (err: any) {
            message.error(err.message || '获取菜单树失败');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (menu: MenuItem | null = null, parentId: number | null = null) => {
        setEditingMenu(menu);
        if (menu) {
            // 编辑模式：回推 slug 和 action
            let action = '';
            let slug = '';
            if (menu.menu_type === 'button' && menu.permission_code) {
                const parts = menu.permission_code.split(':');
                action = parts[parts.length - 1] || '';
            }
            if (menu.path) {
                // 从完整路径中提取最后一段作为 slug
                const parts = menu.path.replace(/^\//, '').split('/');
                slug = parts[parts.length - 1] || '';
            }
            form.setFieldsValue({ ...menu, _action: action, _slug: slug });
        } else {
            form.resetFields();
            form.setFieldsValue({
                parent_id: parentId,
                sort_order: 0,
                is_visible: true,
                menu_type: parentId ? 'menu' : 'directory',
            });
        }
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setSaveLoading(true);

            // 自动拼接完整路由路径
            if (values.menu_type !== 'button') {
                const parentPath = getParentPath(values.parent_id);
                const slug = (values._slug || '').replace(/^\/+/, '').replace(/\/+$/, '');
                values.path = parentPath ? `${parentPath}/${slug}` : `/${slug}`;
            }

            // 根据类型自动填充 permission_code
            if (values.menu_type === 'button') {
                const parent = findNodeById(menus, values.parent_id);
                values.permission_code = buildPermCode(parent?.path, values._action || '');
                values.path = null; // 按钮没有路由
                values.icon = null;
            } else if (values.menu_type === 'menu') {
                values.permission_code = buildMenuPermFromPath(values.path);
            } else {
                // directory 一般不需要权限
                values.permission_code = null;
            }

            // 移除临时字段
            delete values._action;
            delete values._slug;

            if (editingMenu) {
                await updateMenuApi(editingMenu.id, values);
                message.success('更新菜单成功');
            } else {
                await createMenuApi(values);
                message.success('创建菜单成功');
            }

            setIsModalOpen(false);
            fetchMenus();
        } catch (err: any) {
            if (err.errorFields) return;
            message.error(err.message || '操作失败');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteMenuApi(id);
            message.success('删除成功');
            fetchMenus();
        } catch (err: any) {
            message.error(err.message || '删除失败');
        }
    };

    // Flatten tree for parent selection
    const generateSelectList = (treeData: MenuItem[], prefix = '') => {
        let list: { value: number; label: string }[] = [];
        treeData.forEach(item => {
            if (item.menu_type !== 'button') {
                list.push({ value: item.id, label: prefix + item.name });
                if (item.children && item.children.length > 0) {
                    list = list.concat(generateSelectList(item.children, prefix + '— '));
                }
            }
        });
        return list;
    };

    const parentOptions = [
        { value: null as any, label: '📁 根节点 (顶级菜单)' },
        ...generateSelectList(menus)
    ];

    // 实时计算预览：权限标识
    const getPermPreview = () => {
        if (watchMenuType === 'button') {
            const parent = findNodeById(menus, watchParentId);
            return buildPermCode(parent?.path, watchAction || '???');
        }
        if (watchMenuType === 'menu' && computedFullPath) {
            return buildMenuPermFromPath(computedFullPath);
        }
        return null;
    };
    const permPreview = getPermPreview();

    const columns = [
        {
            title: '菜单名称',
            dataIndex: 'name',
            key: 'name',
            fontWeight: 'bold',
        },
        {
            title: '图标',
            dataIndex: 'icon',
            key: 'icon',
            width: 80,
            render: (text: string) => text ? <i className={`ph ph-${text} text-gray-500 text-lg`} /> : '-',
        },
        {
            title: '类型',
            dataIndex: 'menu_type',
            key: 'menu_type',
            width: 100,
            render: (type: string) => {
                const map: Record<string, { color: string; label: string; icon: any }> = {
                    directory: { color: 'blue', label: '目录', icon: <FolderOutlined /> },
                    menu: { color: 'green', label: '菜单', icon: <MenuOutlined /> },
                    button: { color: 'orange', label: '按钮', icon: <AppstoreOutlined /> },
                };
                const config = map[type];
                if (!config) return <Tag>{type}</Tag>;
                return <Tag color={config.color} icon={config.icon}>{config.label}</Tag>;
            }
        },
        {
            title: '路由路径',
            dataIndex: 'path',
            key: 'path',
            render: (text: string) => text ? <code className="px-2 py-0.5 bg-gray-50 rounded text-xs text-gray-600">{text}</code> : <span className="text-gray-300">-</span>,
        },
        {
            title: '权限标识',
            dataIndex: 'permission_code',
            key: 'permission_code',
            render: (text: string) => text ? <Tag color="volcano"><code className="text-xs">{text}</code></Tag> : <span className="text-gray-300">-</span>,
        },
        {
            title: '排序',
            dataIndex: 'sort_order',
            key: 'sort_order',
            width: 80,
        },
        {
            title: '可见',
            dataIndex: 'is_visible',
            key: 'is_visible',
            width: 80,
            render: (visible: boolean) => <Switch checked={visible} disabled size="small" />,
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: MenuItem) => (
                <Space size="middle">
                    {record.menu_type !== 'button' && (
                        <Button type="text" className="text-gray-500 hover:text-green-600 px-0" icon={<PlusOutlined />} onClick={() => openModal(null, record.id)}>
                            下级
                        </Button>
                    )}
                    <Button type="text" className="text-blue-500 hover:text-blue-600 px-0" icon={<EditOutlined />} onClick={() => openModal(record)}>
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除该菜单吗？将会连同子节点一起删除！"
                        onConfirm={() => handleDelete(record.id)}
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger className="px-0" icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    const menuTypeOptions = [
        { label: '📂 目录（分组容器）', value: 'directory' },
        { label: '📄 菜单（页面路由）', value: 'menu' },
        { label: '🔘 按钮（操作权限）', value: 'button' },
    ];

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2 px-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 m-0 leading-tight">资源与权限分配</h2>
                    <span className="text-sm text-gray-400">管理系统的导航菜单、页面及操作按钮权限</span>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} className="rounded-lg shadow-sm shadow-blue-200">
                    新增顶级菜单
                </Button>
            </div>

            <Card className="rounded-2xl shadow-sm border-gray-100 flex-1 overflow-hidden flex flex-col pt-2" bodyStyle={{ padding: '0', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div className="flex-1 overflow-auto p-6">
                    <Table
                        columns={columns}
                        dataSource={menus}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                        className="custom-table"
                        expandable={{
                            defaultExpandAllRows: true
                        }}
                    />
                </div>
            </Card>

            <Modal
                title={editingMenu ? "编辑菜单" : "新增菜单"}
                open={isModalOpen}
                onOk={handleSave}
                onCancel={handleCancel}
                confirmLoading={saveLoading}
                destroyOnClose
                centered
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                >
                    <div className="grid grid-cols-2 gap-x-4">
                        <Form.Item name="parent_id" label="上级菜单" className="col-span-2">
                            <Select options={parentOptions} placeholder="选择上级菜单" showSearch optionFilterProp="label" />
                        </Form.Item>

                        <Form.Item name="menu_type" label="节点类型" rules={[{ required: true }]}>
                            <Select options={menuTypeOptions} />
                        </Form.Item>

                        <Form.Item name="name" label="菜单名称" rules={[{ required: true, message: '请输入名称' }]}>
                            <Input placeholder={watchMenuType === 'button' ? '例如：新增用户' : '例如：系统管理'} />
                        </Form.Item>

                        {/* ─── 目录 & 菜单：路径标识 + 自动拼接预览 ─── */}
                        {watchMenuType !== 'button' && (
                            <>
                                <Form.Item
                                    name="_slug"
                                    label="路径标识"
                                    rules={[{ required: true, message: '请输入路径标识' }]}
                                    tooltip="只需输入当前节点的短名标识，系统会自动拼接上级路径"
                                >
                                    <Input
                                        addonBefore={<span className="text-gray-400 text-xs">{getParentPath(watchParentId) || ''}/</span>}
                                        placeholder={watchMenuType === 'directory' ? 'system' : 'users'}
                                    />
                                </Form.Item>

                                {/* 路由预览 */}
                                {computedFullPath && (
                                    <div className="flex items-center gap-2 -mt-2 mb-3">
                                        <span className="text-xs text-gray-400">完整路由：</span>
                                        <code className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-mono">{computedFullPath}</code>
                                    </div>
                                )}

                                {/* 隐藏字段存储实际 path */}
                                <Form.Item name="path" hidden>
                                    <Input />
                                </Form.Item>
                            </>
                        )}

                        {/* ─── 按钮：显示操作动作下拉 ─── */}
                        {watchMenuType === 'button' && (
                            <Form.Item name="_action" label="操作动作" rules={[{ required: true, message: '请选择操作类型' }]}>
                                <Select
                                    options={COMMON_ACTIONS}
                                    placeholder="选择此按钮代表的操作"
                                    showSearch
                                    optionFilterProp="label"
                                />
                            </Form.Item>
                        )}

                        {/* ─── 目录 & 菜单：显示图标选择 ─── */}
                        {watchMenuType !== 'button' && (
                            <Form.Item name="icon" label="显示图标">
                                <Input placeholder="lucide 图标名，如 Users, Settings" />
                            </Form.Item>
                        )}

                        {/* ─── 权限标识预览 ─── */}
                        {permPreview && (
                            <div className="col-span-2 mb-4">
                                <Alert
                                    type="info"
                                    showIcon
                                    message={
                                        <span>
                                            自动生成权限标识：<Tag color="volcano" className="ml-2"><code>{permPreview}</code></Tag>
                                        </span>
                                    }
                                    description={<span className="text-xs text-gray-400">该标识将自动写入后端，您无需手动输入</span>}
                                />
                            </div>
                        )}

                        {/* ─── 隐藏字段存储实际 permission_code ─── */}
                        <Form.Item name="permission_code" hidden>
                            <Input />
                        </Form.Item>

                        <div className="flex gap-4 col-span-2">
                            <Form.Item name="sort_order" label="排序权重" className="flex-1">
                                <InputNumber min={0} className="w-full" />
                            </Form.Item>

                            {watchMenuType !== 'button' && (
                                <Form.Item name="is_visible" label="菜单可见性" valuePropName="checked" className="flex-1">
                                    <Switch checkedChildren="显示" unCheckedChildren="隐藏" />
                                </Form.Item>
                            )}
                        </div>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default MenuManagement;
