import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, Input, Badge, Avatar } from 'antd';
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
    LayoutDashboard,
    ShieldAlert,
    Network,
    Key
} from 'lucide-react';

const DashboardLayout: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

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
        },
        {
            key: 'grp3',
            label: '系统管理',
            type: 'group' as const,
            children: [
                { key: '/system/users', icon: <Settings size={18} />, label: '用户管理' },
                { key: '/system/roles', icon: <ShieldAlert size={18} />, label: '角色与权限' },
                { key: '/system/departments', icon: <Network size={18} />, label: '部门架构' },
                { key: '/system/menus', icon: <Key size={18} />, label: '菜单权限管理' },
            ]
        }
    ];

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-[#f8fbff]">

            {/* Sidebar 侧边栏 */}
            <div className="w-[240px] flex-shrink-0 bg-white border-r border-gray-100 flex flex-col z-20 shadow-sm relative transition-all duration-300">

                {/* 系统 Logo */}
                <div className="h-16 flex-shrink-0 flex items-center px-6 gap-3 pt-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-200">
                        N
                    </div>
                    <span className="text-xl font-bold text-gray-800 tracking-tight">NexFlow OA</span>
                </div>

                {/* 菜单列表区域 */}
                <div className="flex-1 overflow-y-auto px-4 py-2 mt-2 custom-scrollbar pb-32">
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        onClick={(info) => navigate(info.key)}
                        items={menuItems}
                        className="border-none bg-transparent"
                        style={{ fontSize: '15px' }}
                    />
                </div>

                {/* 底部日期悬浮挂件 */}
                <div className="absolute bottom-6 left-4 right-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg shadow-blue-200 pointer-events-none">
                    <div className="text-blue-100 text-sm mb-1">当前日期</div>
                    <div className="text-2xl font-bold mb-1">2026.02.22</div>
                    <div className="bg-blue-400/40 w-max px-2 py-0.5 rounded text-xs">星期日</div>
                    <div className="absolute right-4 bottom-4 opacity-20">
                        <Calendar size={48} />
                    </div>
                </div>
            </div>

            {/* Main Container 主右侧容器 */}
            <div className="flex-1 flex flex-col min-w-0 relative">

                {/* Top Header 顶部栏 */}
                <header className="flex-shrink-0 bg-white/90 backdrop-blur-md h-16 px-8 flex items-center justify-between border-b border-gray-100/50 sticky top-0 z-10 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">

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

                </header>

                {/* Content Area 核心内容页 */}
                <main className="flex-1 overflow-auto p-6 scroll-smooth bg-transparent">
                    <Outlet />
                </main>

            </div>

        </div>
    );
};

export default DashboardLayout;
