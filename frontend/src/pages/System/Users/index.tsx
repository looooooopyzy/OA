import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Input, Space, Tag, Modal, Form, Switch, message, Popconfirm, Badge, TreeSelect, Select } from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getUserListApi, createUserApi, updateUserApi, deleteUserApi } from '@/utils/userApi';
import type { UserItem } from '@/utils/userApi';
import { getDepartmentTreeApi } from '@/utils/departmentApi';
import type { DepartmentItem } from '@/utils/departmentApi';
import { getRoleListApi } from '@/utils/roleApi';
import type { RoleItem } from '@/utils/roleApi';

const { Search } = Input;

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [departments, setDepartments] = useState<DepartmentItem[]>([]);
    const [allRoles, setAllRoles] = useState<RoleItem[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [params, setParams] = useState({ page: 1, page_size: 10, keyword: '' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserItem | null>(null);
    const [form] = Form.useForm();
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [params]);

    useEffect(() => {
        fetchDepartments();
        fetchAllRoles();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await getDepartmentTreeApi();
            setDepartments(res.data);
        } catch (err) {
            console.error('Failed to fetch departments', err);
        }
    };

    const fetchAllRoles = async () => {
        try {
            const res = await getRoleListApi({ page: 1, page_size: 100 });
            setAllRoles(res.data.items);
        } catch (err) {
            console.error('Failed to fetch roles', err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await getUserListApi(params);
            setUsers(res.data.items);
            setTotal(res.data.total);
        } catch (err: any) {
            message.error(err.message || '获取用户列表失败');
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

    const openModal = (user: UserItem | null = null) => {
        setEditingUser(user);
        if (user) {
            // Edit
            form.setFieldsValue({
                ...user,
                role_ids: user.roles.map(r => r.id),
            });
        } else {
            // Create
            form.resetFields();
            form.setFieldsValue({ is_active: true });
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

            if (editingUser) {
                // Remove empty password if not changed
                if (!values.password) {
                    delete values.password;
                }
                await updateUserApi(editingUser.id, values);
                message.success('更新用户成功');
            } else {
                await createUserApi(values);
                message.success('创建用户成功');
            }

            setIsModalOpen(false);
            fetchUsers();
        } catch (err: any) {
            if (err.errorFields) return; // validation error
            message.error(err.message || '操作失败');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteUserApi(id);
            message.success('删除成功');
            fetchUsers();
        } catch (err: any) {
            message.error(err.message || '删除失败');
        }
    };

    const columns = [
        {
            title: '用户名',
            dataIndex: 'username',
            key: 'username',
            fontWeight: 'bold',
        },
        {
            title: '真实姓名',
            dataIndex: 'real_name',
            key: 'real_name',
        },
        {
            title: '部门',
            dataIndex: 'department_name',
            key: 'department_name',
            render: (text: string) => text || '-',
        },
        {
            title: '角色',
            key: 'roles',
            render: (_: any, record: UserItem) => (
                <Space size={[0, 4]} wrap>
                    {record.roles.length > 0 ? record.roles.map(r => (
                        <Tag color="geekblue" key={r.id}>{r.name}</Tag>
                    )) : <span className="text-gray-400">-</span>}
                </Space>
            )
        },
        {
            title: '状态',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (isActive: boolean) => (
                <Badge status={isActive ? 'success' : 'error'} text={isActive ? '启用' : '禁用'} />
            )
        },
        {
            title: '联系方式',
            key: 'contact',
            render: (_: any, record: UserItem) => (
                <div className="text-xs text-gray-500">
                    <div>{record.phone || '-'}</div>
                    <div>{record.email || '-'}</div>
                </div>
            )
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
            render: (_: any, record: UserItem) => (
                <Space size="middle">
                    <Button type="text" className="text-blue-500 hover:text-blue-600 px-0" icon={<EditOutlined />} onClick={() => openModal(record)}>编辑</Button>
                    {record.username !== 'admin' && (
                        <Popconfirm
                            title="确定要删除该用户吗？"
                            onConfirm={() => handleDelete(record.id)}
                            okButtonProps={{ danger: true }}
                        >
                            <Button type="text" danger className="px-0" icon={<DeleteOutlined />}>删除</Button>
                        </Popconfirm>
                    )}
                </Space>
            ),
        },
    ];

    // Note: We need Badge import
    return (
        <div className="h-full flex flex-col gap-4">
            <div className="flex justify-between items-center mb-2 px-2">
                <div>
                    <h2 className="text-xl font-bold text-gray-800 m-0 leading-tight">用户管理</h2>
                    <span className="text-sm text-gray-400">管理系统账号、部门归属与角色分配</span>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} className="rounded-lg shadow-sm shadow-blue-200">
                    新增用户
                </Button>
            </div>

            <Card className="rounded-2xl shadow-sm border-gray-100 flex-1 overflow-hidden flex flex-col pt-2" bodyStyle={{ padding: '0', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div className="px-6 py-4 border-b border-gray-50">
                    <Search
                        placeholder="搜索用户名或真实姓名..."
                        allowClear
                        onSearch={handleSearch}
                        className="w-80"
                        prefix={<SearchOutlined className="text-gray-400" />}
                    />
                </div>

                <div className="flex-1 overflow-auto p-6">
                    <Table
                        columns={columns}
                        dataSource={users}
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
                title={editingUser ? "编辑用户" : "新增用户"}
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
                        <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
                            <Input disabled={!!editingUser} placeholder="登录账号" />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            label={editingUser ? "重置密码" : "初始密码"}
                            rules={[{ required: !editingUser, message: '请输入初始密码' }]}
                        >
                            <Input.Password placeholder={editingUser ? "不修改请留空" : "登录密码"} />
                        </Form.Item>

                        <Form.Item name="real_name" label="真实姓名">
                            <Input placeholder="员工姓名" />
                        </Form.Item>

                        <Form.Item name="phone" label="手机号码">
                            <Input placeholder="联系手机" />
                        </Form.Item>

                        <Form.Item name="department_id" label="所属部门" rules={[{ required: true, message: '请选择所属部门' }]}>
                            <TreeSelect
                                treeData={departments}
                                fieldNames={{ label: 'name', value: 'id', children: 'children' }}
                                placeholder="选择分配的部门"
                                allowClear
                                treeDefaultExpandAll
                            />
                        </Form.Item>

                        <Form.Item name="role_ids" label="分配角色" rules={[{ required: true, message: '请选择至少一个角色' }]}>
                            <Select
                                mode="multiple"
                                placeholder="选择角色的权限组"
                                allowClear
                                options={allRoles.map(r => ({ label: r.name, value: r.id }))}
                            />
                        </Form.Item>

                        <Form.Item name="email" label="电子邮箱">
                            <Input placeholder="工作邮箱" />
                        </Form.Item>

                        <Form.Item name="is_active" label="账号状态" valuePropName="checked">
                            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
                        </Form.Item>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
