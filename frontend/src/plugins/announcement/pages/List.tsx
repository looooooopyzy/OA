import React, { useEffect, useState } from 'react';
import { Table, Button, Space, message, Card } from 'antd';
import request from '@/utils/request';

interface Announcement {
    id: number;
    title: string;
    content: string;
    read_count: number;
    created_at: string;
}

export default function AnnouncementList() {
    const [data, setData] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);

    const fetchData = async (page = 1) => {
        setLoading(true);
        try {
            const res = await request.get('/api/v1/plugins/announcement/list', {
                params: { page, page_size: 10 }
            });
            setData(res.data.data.items);
            setTotal(res.data.data.total);
        } catch (e: any) {
            message.error(e.message || '获取列表失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <Card title="公告大厅" bordered={false} className="shadow-sm rounded-lg">
            <Table
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={{ total, onChange: fetchData }}
                columns={[
                    { title: '#', dataIndex: 'id', width: 80 },
                    { title: '标题', dataIndex: 'title' },
                    { title: '阅读量', dataIndex: 'read_count', width: 100 },
                    { title: '发布时间', dataIndex: 'created_at', render: (t) => new Date(t).toLocaleString() },
                ]}
            />
        </Card>
    );
}
