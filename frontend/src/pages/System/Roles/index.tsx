import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Input, Space, Tag, Modal, Form, TreeSelect, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getRoleListApi, createRoleApi, updateRoleApi, deleteRoleApi } from '@/utils/roleApi';
import type { RoleItem } from '@/utils/roleApi';
import { getDepartmentTreeApi } from '@/utils/departmentApi';
import type { DepartmentItem } from '@/utils/departmentApi';

const { Search } = Input;

const RoleManagement: React.FC = () => {
    const [roles, setRoles] = useState<RoleItem[]>([]);
    const [departments, setDepartments] = useState<DepartmentItem[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState({ page: 1, page_size: 10, keyword: '' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
    const [form] = Form.useForm();
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, [params]);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await getDepartmentTreeApi();
            setDepartments(res.data);
        } catch (err) {
            console.error('Failed to fetch departments', err);
        }
    };

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const res = await getRoleListApi(params);
            setRoles(res.data.items);
            setTotal(res.data.total);
        } catch (err: any) {
            message.error(err.message || '获取角色列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setParams({ ...params, page: 1, keyword: value });
    };

    const handleTableChange = (pagination: any) => {
        setParams({
            ...params,
            page: pagination.current,
            page_size: pagination.pageSize,
        });
    };

    const openModal = (role: RoleItem | null = null) => {
        setEditingRole(role);
        if (role) {
            form.setFieldsValue({
                ...role,
                department_ids: role.departments?.map((d: any) => d.id) || [],
            });
        } else {
            form.resetFields();
            form.setFieldsValue({ data_scope: 'self', department_ids: [] });
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

            if (editingRole) {
                await updateRoleApi(editingRole.id, values);
                message.success('更新角色成功');
            } else {
                await createRoleApi(values);
                message.success('创建角色成功');
            }

            setIsModalOpen(false);
            fetchRoles();
        } catch (err: any) {
            if (err.errorFields) return;
            message.error(err.message || '操作失败');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteRoleApi(id);
            message.success('删除成功');
            fetchRoles();
        } catch (err: any) {
            message.error(err.message || '删除失败');
        }
    };

    const columns = [
        {
            title: '角色名称',
            dataIndex: 'name',
            key: 'name',
            fontWeight: 'bold',
        },
        {
            title: '所属部门',
            dataIndex: 'departments',
            key: 'departments',
            render: (departments: any[]) => departments && departments.length > 0
                ? <Space size={[0, 4]} wrap>{departments.map(d => <Tag color="blue" key={d.id}>{d.name}</Tag>)}</Space>
                : <span className="text-gray-400">全局</span>,
        },
        {
            title: '数据权限',
            dataIndex: 'data_scope',
            key: 'data_scope',
            render: (scope: string) => {
                const map: Record<string, string> = {
                    all: '全部数据',
                    dept: '本部门数据',
                    dept_custom: '自定义部门',
                    self: '仅本人数据',
                };
                return <Tag color="blue">{map[scope] || scope}</Tag>;
            }
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            render: (text: string) => text || <span className="text-gray-400">暂无描述</span>,
        },
        {
            title: '创建时间',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (val: string) => <span className="text-gray-400 text-xs">{new Date(val).toLocaleDateString()}</span>
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: RoleItem) => (
                <Space size="middle">
                    <Button type="text" className="text-blue-500 hover:text-blue-600 px-0" icon={<EditOutlined />} onClick={() => openModal(record)}>编辑</Button>
                    <Popconfirm
                        title="确定要删除该角色吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okButtonProps={{ danger: true }}
                    >
                        <Button type="text" danger className="px-0" icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2 px-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 m-0 leading-tight">角色管理</h2>
                    <span className="text-sm text-gray-400">管理系统角色、数据权限范围</span>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} className="rounded-lg shadow-sm shadow-blue-200">
                    新增角色
                </Button>
            </div>

            <Card className="rounded-2xl shadow-sm border-gray-100 flex-1 overflow-hidden flex flex-col pt-2" bodyStyle={{ padding: '0', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div className="px-6 py-4 border-b border-gray-50">
                    <Search
                        placeholder="搜索角色名称或标识..."
                        allowClear
                        onSearch={handleSearch}
                        className="w-80"
                        prefix={<SearchOutlined className="text-gray-400" />}
                    />
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <Table
                        columns={columns}
                        dataSource={roles}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            current: params.page,
                            pageSize: params.page_size,
                            total: total,
                            showSizeChanger: true,
                            showTotal: (total) => `共 ${total} 条记录`,
                        }}
                        onChange={handleTableChange}
                        className="custom-table"
                    />
                </div>
            </Card>

            <Modal
                title={editingRole ? "编辑角色" : "新增角色"}
                open={isModalOpen}
                onOk={handleSave}
                onCancel={handleCancel}
                confirmLoading={saveLoading}
                destroyOnClose
                centered
            >
                <Form
                    form={form}
                    layout="vertical"
                    className="mt-4"
                >
                    <div className="grid grid-cols-2 gap-x-4">
                        <Form.Item name="name" label="角色名称" rules={[{ required: true, message: '请输入角色名称' }]}>
                            <Input placeholder="例如：行政专员" />
                        </Form.Item>

                        <Form.Item name="department_ids" label="所属部门">
                            <TreeSelect
                                treeData={departments}
                                fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                                placeholder="选择绑定的部门 (支持多选，留空则为全局角色)"
                                allowClear
                                multiple
                                treeCheckable
                                showCheckedStrategy={TreeSelect.SHOW_ALL}
                                treeDefaultExpandAll
                            />
                        </Form.Item>

                        <Form.Item name="data_scope" label="数据权限范围" className="col-span-2" rules={[{ required: true }]}>
                            <Input placeholder="self / dept / all (以后替换为 Select 选择器)" />
                        </Form.Item>

                        <Form.Item name="description" label="角色描述" className="col-span-2">
                            <Input.TextArea rows={3} placeholder="输入关于此角色权限的简短描述..." />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default RoleManagement;
