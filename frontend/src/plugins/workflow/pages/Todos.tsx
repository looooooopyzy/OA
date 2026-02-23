import { useEffect, useState } from 'react';
import { Card, Table, Button, message, Space, Modal, Input } from 'antd';
import request from '@/utils/request';

export default function WorkflowTodos() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionModal, setActionModal] = useState({ visible: false, task: null, action: '' });
    const [comment, setComment] = useState('');

    const fetchTodos = async () => {
        setLoading(true);
        try {
            const res = await request.get('/plugins/workflow/tasks/todo', { params: { page: 1, page_size: 50 } });
            if (res.data.code === 200) {
                setData(res.data.data.items);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    const handleProcess = async () => {
        try {
            const res = await request.post(`/plugins/workflow/tasks/${actionModal.task.id}/process`, {
                action: actionModal.action,
                comment: comment
            });
            if (res.data.code === 200) {
                message.success('处理成功！');
                setActionModal({ visible: false, task: null, action: '' });
                setComment('');
                fetchTodos();
            }
        } catch (e) {
            //
        }
    };

    const showModal = (task: any, action: string) => {
        setActionModal({ visible: true, task, action });
    };

    const columns = [
        { title: '任务ID', dataIndex: 'id', width: 80 },
        { title: '节点名称', dataIndex: 'node_name' },
        { title: '状态', dataIndex: 'status' },
        { title: '到达时间', dataIndex: 'created_at', render: (val: string) => new Date(val).toLocaleString() },
        {
            title: '操作',
            render: (_, record) => (
                <Space>
                    <Button type="primary" size="small" onClick={() => showModal(record, 'agree')}>
                        同意
                    </Button>
                    <Button danger size="small" onClick={() => showModal(record, 'reject')}>
                        拒绝
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div className="p-4">
            <Card title="我的待办任务" className="shadow-sm">
                <Table
                    columns={columns}
                    dataSource={data}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                />
            </Card>

            <Modal
                title={actionModal.action === 'agree' ? '同意审批' : '拒绝审批'}
                open={actionModal.visible}
                onOk={handleProcess}
                onCancel={() => setActionModal({ visible: false, task: null, action: '' })}
            >
                <div className="mb-2">确认要 {actionModal.action === 'agree' ? '同意' : '拒绝'} 节点 [{actionModal.task?.node_name}] 的审批吗？</div>
                <Input.TextArea
                    rows={4}
                    placeholder="请输入审批意见（选填）"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                />
            </Modal>
        </div>
    );
}
