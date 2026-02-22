import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '@/store/useAuthStore';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const login = useAuthStore((s) => s.login);
    const loading = useAuthStore((s) => s.loading);
    const [shake, setShake] = useState(false);

    const onFinish = async (values: { username: string; password: string }) => {
        try {
            await login(values.username, values.password);
            message.success('登录成功，欢迎回来！');
            navigate('/', { replace: true });
        } catch (err: any) {
            setShake(true);
            setTimeout(() => setShake(false), 500);
            message.error(err.message || '登录失败，请检查用户名或密码');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
            {/* 装饰性背景元素 */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-400/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-300/10 rounded-full blur-3xl"></div>

            <div className={`w-full max-w-[420px] mx-4 ${shake ? 'animate-shake' : ''}`}>
                {/* Logo & Branding */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-lg shadow-blue-200 mb-5">
                        <span className="text-white font-bold text-3xl tracking-tight">N</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2 tracking-tight">NexFlow OA</h1>
                    <p className="text-gray-400 text-sm">微内核协同办公系统 · 登录到您的工作台</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-white/80">
                    <Form
                        name="login"
                        size="large"
                        onFinish={onFinish}
                        autoComplete="off"
                        layout="vertical"
                        initialValues={{ remember: true }}
                    >
                        <Form.Item
                            name="username"
                            rules={[{ required: true, message: '请输入用户名' }]}
                        >
                            <Input
                                prefix={<UserOutlined className="text-gray-300" />}
                                placeholder="用户名"
                                className="rounded-xl h-12 bg-gray-50/80 border-gray-100 hover:border-blue-300 focus:border-blue-500 px-4"
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: '请输入密码' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-gray-300" />}
                                placeholder="密码"
                                className="rounded-xl h-12 bg-gray-50/80 border-gray-100 hover:border-blue-300 focus:border-blue-500 px-4"
                            />
                        </Form.Item>

                        <Form.Item>
                            <div className="flex justify-between items-center">
                                <Form.Item name="remember" valuePropName="checked" noStyle>
                                    <Checkbox className="text-gray-500 text-sm">记住我</Checkbox>
                                </Form.Item>
                                <a className="text-sm text-blue-500 hover:text-blue-600 transition-colors" href="#">
                                    忘记密码?
                                </a>
                            </div>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                className="rounded-xl h-12 bg-gradient-to-r from-blue-500 to-blue-600 border-none shadow-lg shadow-blue-200/60 hover:shadow-blue-300/60 hover:from-blue-600 hover:to-blue-700 text-base font-medium transition-all duration-300"
                            >
                                {loading ? '正在登录...' : '登 录'}
                            </Button>
                        </Form.Item>
                    </Form>

                    <div className="text-center mt-2">
                        <span className="text-xs text-gray-300">默认账号: admin / admin123</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-xs text-gray-300">
                    © 2026 NexFlow OA · 微内核架构驱动
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
