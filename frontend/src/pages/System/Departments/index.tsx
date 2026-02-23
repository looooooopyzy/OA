import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, InputNumber, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { getDepartmentTreeApi, createDepartmentApi, updateDepartmentApi, deleteDepartmentApi } from '@/utils/departmentApi';
import type { DepartmentItem } from '@/utils/departmentApi';

const DepartmentManagement: React.FC = () => {
    const [departments, setDepartments] = useState<DepartmentItem[]>([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDept, setEditingDept] = useState<DepartmentItem | null>(null);
    const [parentDeptId, setParentDeptId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const [saveLoading, setSaveLoading] = useState(false);

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const res = await getDepartmentTreeApi();
            setDepartments(res.data);
        } catch (err: any) {
            message.error(err.message || '获取部门树失败');
        } finally {
            setLoading(false);
        }
    };

    const openModal = (dept: DepartmentItem | null = null, parentId: number | null = null) => {
        setEditingDept(dept);
        setParentDeptId(parentId);
        if (dept) {
            form.setFieldsValue(dept);
        } else {
            form.resetFields();
            form.setFieldsValue({ parent_id: parentId, sort_order: 0 });
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

            if (editingDept) {
                await updateDepartmentApi(editingDept.id, values);
                message.success('更新部门成功');
            } else {
                await createDepartmentApi(values);
                message.success('创建部门成功');
            }

            setIsModalOpen(false);
            fetchDepartments();
        } catch (err: any) {
            if (err.errorFields) return;
            message.error(err.message || '操作失败');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteDepartmentApi(id);
            message.success('删除成功');
            fetchDepartments();
        } catch (err: any) {
            message.error(err.message || '删除失败');
        }
    };

    const columns = [
        {
            title: '部门名称',
            dataIndex: 'name',
            key: 'name',
            fontWeight: 'bold',
            render: (text: string) => <span className="font-medium text-gray-800">{text}</span>
        },
        {
            title: '排序权重',
            dataIndex: 'sort_order',
            key: 'sort_order',
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
            render: (_: any, record: DepartmentItem) => (
                <Space size="middle">
                    <Button type="text" className="text-blue-500 hover:text-blue-600 px-0" icon={<PlusOutlined />} onClick={() => openModal(null, record.id)}>添加子部门</Button>
                    <Button type="text" className="text-blue-500 hover:text-blue-600 px-0" icon={<EditOutlined />} onClick={() => openModal(record)}>编辑</Button>
                    <Popconfirm
                        title="确定要删除该部门吗？(如果是父部门则要求无子节点)"
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
                    <h2 className="text-xl font-bold text-gray-800 m-0 leading-tight">组织架构与部门管理</h2>
                    <span className="text-sm text-gray-400">管理公司的部门层级关系，支持无限极树状结构</span>
                </div>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => openModal()} className="rounded-lg shadow-sm shadow-blue-200">
                    新增顶级部门
                </Button>
            </div>

            <Card className="rounded-2xl shadow-sm border-gray-100 flex-1 overflow-hidden flex flex-col pt-2" bodyStyle={{ padding: '0', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <div className="flex-1 overflow-auto p-6">
                    <Table
                        columns={columns}
                        dataSource={departments}
                        rowKey="id"
                        loading={loading}
                        pagination={false}
                        expandable={{ defaultExpandAllRows: true }}
                        className="custom-table"
                    />
                </div>
            </Card>

            <Modal
                title={editingDept ? "编辑部门" : "新增部门"}
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
                    <Form.Item name="parent_id" hidden>
                        <Input />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-x-4">
                        <Form.Item name="name" label="部门名称" rules={[{ required: true, message: '请输入部门名称' }]} className="col-span-2">
                            <Input placeholder="输入中文名称，例如：研发部" />
                        </Form.Item>

                        <Form.Item name="sort_order" label="排序权重" rules={[{ required: true, message: '请输入数字' }]}>
                            <InputNumber className="w-full" placeholder="数字越小越靠前" />
                        </Form.Item>
                    </div>
                    {parentDeptId && !editingDept && (
                        <div className="text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                            提示：您正在添加子部门 (上级部门ID: {parentDeptId})
                        </div>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default DepartmentManagement;
