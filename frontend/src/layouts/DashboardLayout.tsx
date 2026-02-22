import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Layout, Menu, Input, Badge, Avatar } from 'antd';
import {
    Briefcase,
    CheckSquare,
    FileText,
    Bell,
    Settings,
    Calendar,
    PieChart,
    Users,
    Search,
    LayoutDashboard
} from 'lucide-react';

const { Header, Sider, Content } = Layout;

const DashboardLayout: React.FC = () => {
    const location = useLocation();

    const menuItems = [
        {
            key: 'grp1',
            label: '常用模块',
            type: 'group' as const,
            children: [
                { key: '/', icon: <LayoutDashboard size={18} />, label: '工作台' },
                {
                    key: '/todos',
                    icon: <CheckSquare size={18} />,
                    label: (
                        <div className="flex justify-between items-center w-full pr-2">
                            <span>待办事项</span>
                            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">12</span>
                        </div>
                    )
                },
            ]
        },
        { key: '/approvals', icon: <FileText size={18} />, label: '流程审批' },
        { key: '/notices', icon: <Bell size={18} />, label: '公告通知' },
        {
            key: 'grp2',
            label: '企业资产',
            type: 'group' as const,
            children: [
                { key: '/docs', icon: <Briefcase size={18} />, label: '公文管理' },
                { key: '/calendar', icon: <Calendar size={18} />, label: '日程会议' },
                { key: '/stats', icon: <PieChart size={18} />, label: '数据统计' },
                { key: '/hr', icon: <Users size={18} />, label: '人力资源' },
            ]
        }
    ];

    return (
        <Layout className="min-h-screen bg-[#f8fbff]">
            {/* Sidebar */}
            <Sider
                width={240}
                theme="light"
                className="border-r border-gray-100 fixed h-screen left-0 top-0 z-10 shadow-sm transition-all duration-300"
            >
                <div className="h-16 flex items-center px-6 gap-3 pt-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-200">
                        N
                    </div>
                    <span className="text-xl font-bold text-gray-800 tracking-tight">NexFlow OA</span>
                </div>

                <div className="px-4 py-2 mt-2 h-[calc(100vh-[240px])] overflow-y-auto custom-scrollbar">
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        items={menuItems}
                        className="border-none bg-transparent"
                        style={{ fontSize: '15px' }}
                    />
                </div>

                {/* Bottom Date Widget */}
                <div className="absolute bottom-6 left-4 right-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg shadow-blue-200">
                    <div className="text-blue-100 text-sm mb-1">当前日期</div>
                    <div className="text-2xl font-bold mb-1">2026.02.22</div>
                    <div className="bg-blue-400/40 w-max px-2 py-0.5 rounded text-xs">星期日</div>
                    <div className="absolute right-4 bottom-4 opacity-20">
                        <Calendar size={48} />
                    </div>
                </div>
            </Sider>

            {/* Main Container */}
            <Layout className="ml-[240px] bg-transparent">
                {/* Top Header */}
                <Header className="bg-white/80 backdrop-blur-md h-16 px-8 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
                    <div className="w-1/3 max-w-md">
                        <Input
                            prefix={<Search className="text-gray-400 mr-2" size={18} />}
                            placeholder="搜索流程、公文、或员工..."
                            className="bg-gray-50 border-transparent hover:border-blue-300 focus:border-blue-400 rounded-full py-1.5 px-4"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-4 text-gray-500">
                            <Badge dot color="red">
                                <Bell size={20} className="cursor-pointer hover:text-blue-600 transition-colors" />
                            </Badge>
                            <Settings size={20} className="cursor-pointer hover:text-blue-600 transition-colors" />
                        </div>

                        <div className="flex items-center gap-3 border-l border-gray-200 pl-6 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-medium text-gray-800 leading-tight">陈经理</span>
                                <span className="text-xs text-gray-400">行政管理部</span>
                            </div>
                            <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4" size={38} className="border border-gray-200 shadow-sm" />
                        </div>
                    </div>
                </Header>

                {/* Content Area */}
                <Content className="p-6 h-[calc(100vh-64px)] overflow-auto">
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;
