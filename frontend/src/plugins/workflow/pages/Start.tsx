import { useEffect, useState } from 'react';
import { Card, Table, Button, message, Space, Tag } from 'antd';
import request from '@/utils/request';

export default function WorkflowStart() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchDefs = async () => {
        setLoading(true);
        try {
            const res = await request.get('/plugins/workflow/defs', { params: { page: 1, page_size: 50 } });
            if (res.data.code === 200) {
                setData(res.data.data.items);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDefs();
    }, []);

    const handleStart = async (record: any) => {
        try {
            const res = await request.post('/plugins/workflow/instances', {
                workflow_def_id: record.id,
                title: `发起[${record.name}]申请`,
                business_data: {}
            });
            if (res.data.code === 200) {
                message.success('流程发起成功！');
            }
        } catch (e) {
            //
        }
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', width: 80 },
        { title: '流程名称', dataIndex: 'name' },
        { title: '描述', dataIndex: 'description' },
        { title: '状态', dataIndex: 'is_active', render: (val: boolean) => val ? <Tag color="success">启用</Tag> : <Tag color="error">停用</Tag> },
        { title: '创建时间', dataIndex: 'created_at', render: (val: string) => new Date(val).toLocaleString() },
        {
            title: '操作',
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" onClick={() => handleStart(record)} disabled={!record.is_active}>
                        发起审批
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="p-4">
            <Card title="选择流程发起" className="shadow-sm">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />
            </Card>
        </div>
    );
}
