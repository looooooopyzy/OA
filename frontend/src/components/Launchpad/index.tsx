import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    CheckSquare,
    FileText,
    Calendar,
    Settings,
    PieChart,
    Users,
    MessageSquare,
    Database,
    Mail,
    Folders,
    MonitorPlay,
    X
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

// 模拟的系统应用和插件数据
const applications = [
    { id: 'workbench', path: '/', icon: <LayoutDashboard size={48} strokeWidth={1.5} />, label: '工作台', color: 'bg-blue-500' },
    { id: 'todos', path: '/todos', icon: <CheckSquare size={48} strokeWidth={1.5} />, label: '待办事项', color: 'bg-orange-500' },
    { id: 'approvals', path: '/approvals', icon: <FileText size={48} strokeWidth={1.5} />, label: '流程审批', color: 'bg-green-500' },
    { id: 'docs', path: '/docs', icon: <Folders size={48} strokeWidth={1.5} />, label: '公文库', color: 'bg-indigo-500' },
    { id: 'calendar', path: '/calendar', icon: <Calendar size={48} strokeWidth={1.5} />, label: '日程会议', color: 'bg-rose-500' },
    { id: 'mail', path: '/mail', icon: <Mail size={48} strokeWidth={1.5} />, label: '内部邮件', color: 'bg-sky-500' },
    { id: 'chat', path: '/chat', icon: <MessageSquare size={48} strokeWidth={1.5} />, label: '即时通讯', color: 'bg-emerald-500' },
    { id: 'hr', path: '/hr', icon: <Users size={48} strokeWidth={1.5} />, label: '人力资源', color: 'bg-amber-500' },
    { id: 'stats', path: '/stats', icon: <PieChart size={48} strokeWidth={1.5} />, label: '数据报表', color: 'bg-purple-500' },
    { id: 'assets', path: '/assets', icon: <Database size={48} strokeWidth={1.5} />, label: '资产管理', color: 'bg-cyan-600' },
    { id: 'monitor', path: '/monitor', icon: <MonitorPlay size={48} strokeWidth={1.5} />, label: '系统监控', color: 'bg-slate-700' },
    { id: 'settings', path: '/system/users', icon: <Settings size={48} strokeWidth={1.5} />, label: '系统设置', color: 'bg-gray-600' },
];

const Launchpad: React.FC = () => {
    const { isLaunchpadOpen, setLaunchpadOpen } = useAppStore();
    const navigate = useNavigate();

    // 监听 ESC 键关闭
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isLaunchpadOpen) {
                setLaunchpadOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLaunchpadOpen, setLaunchpadOpen]);

    if (!isLaunchpadOpen) return null;

    const handleAppClick = (path: string) => {
        setLaunchpadOpen(false);
        navigate(path);
    };

    return (
        <div
            className="fixed inset-0 z-[100] launchpad-bg-anim pointer-events-auto"
            style={{
                // 强力背景模糊和暗化
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(0, 0, 0, 0.4)'
            }}
            onClick={() => setLaunchpadOpen(false)} // 点击空白处关闭
        >
            <style>
                {`
                @keyframes launchpadFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes launchpadZoomIn {
                    from { transform: scale(0.95) translateY(10px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
                .launchpad-bg-anim {
                    animation: launchpadFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .launchpad-grid-anim {
                    animation: launchpadZoomIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                `}
            </style>

            {/* 顶部关闭按钮 */}
            <div className="absolute top-8 right-8 z-10">
                <button
                    onClick={() => setLaunchpadOpen(false)}
                    className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white/80 hover:text-white transition-all backdrop-blur-md"
                    title="关闭 (ESC)"
                >
                    <X size={24} />
                </button>
            </div>

            <div
                className="w-full h-full flex items-center justify-center p-12"
                onClick={(e) => e.stopPropagation()} // 防止点击应用区域关闭
            >
                {/* 搜索框预留 */}
                <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[400px]">
                    <div className="bg-white/10 border border-white/20 rounded-full px-6 py-3 flex items-center backdrop-blur-md">
                        <span className="text-white/60 text-lg">🔍 搜索应用...</span>
                    </div>
                </div>

                {/* 应用网格 */}
                <div className="launchpad-grid-anim grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-8 gap-y-12 max-w-6xl w-full mx-auto">
                    {applications.map((app) => (
                        <div
                            key={app.id}
                            className="flex flex-col items-center gap-3 cursor-pointer group"
                            onClick={() => handleAppClick(app.path)}
                        >
                            {/* App Icon Container */}
                            <div className={`w-20 h-20 rounded-2xl shadow-lg flex flex-col items-center justify-center text-white transition-all duration-300 ease-out transform group-hover:scale-110 group-active:scale-95 ${app.color}`}>
                                {app.icon}
                            </div>

                            {/* App Label */}
                            <span className="text-white font-medium text-sm tracking-wide text-shadow-sm group-hover:text-white/90">
                                {app.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Launchpad;
