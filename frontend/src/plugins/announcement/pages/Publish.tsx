import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import request from '@/utils/request';

export default function AnnouncementPublish() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await request.post('/api/v1/plugins/announcement/publish', values);
            message.success('发布成功');
            form.resetFields();
        } catch (e: any) {
            message.error(e.message || '发布失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="发布公告" bordered={false} className="shadow-sm rounded-lg max-w-4xl">
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
                    <Input placeholder="输入公告标题" size="large" />
                </Form.Item>
                <Form.Item name="content" label="正文" rules={[{ required: true, message: '请输入正文' }]}>
                    <Input.TextArea placeholder="输入正文（暂不支持富文本，仅作示例）" rows={10} />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading} size="large">
                        立即发布
                    </Button>
                </Form.Item>
            </Form>
        </Card>
    );
}
