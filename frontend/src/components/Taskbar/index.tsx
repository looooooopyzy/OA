import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tooltip } from 'antd';
import {
    LayoutDashboard,
    CheckSquare,
    FileText,
    Calendar,
    Settings,
    Briefcase,
    PieChart
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

interface DockItem {
    id: string;
    path: string;
    icon: React.ReactNode;
    label: string;
    color: string;
}

const pinnedApps: DockItem[] = [
    { id: 'workbench', path: '/', icon: <LayoutDashboard size={24} />, label: '工作台', color: 'bg-blue-500' },
    { id: 'todos', path: '/todos', icon: <CheckSquare size={24} />, label: '待办事项', color: 'bg-orange-500' },
    { id: 'approvals', path: '/approvals', icon: <FileText size={24} />, label: '流程审批', color: 'bg-green-500' },
    { id: 'docs', path: '/docs', icon: <Briefcase size={24} />, label: '公文管理', color: 'bg-indigo-500' },
    { id: 'calendar', path: '/calendar', icon: <Calendar size={24} />, label: '日程会议', color: 'bg-rose-500' },
    { id: 'stats', path: '/stats', icon: <PieChart size={24} />, label: '数据统计', color: 'bg-purple-500' },
    { id: 'system', path: '/system/users', icon: <Settings size={24} />, label: '系统管理', color: 'bg-gray-700' },
];

const Taskbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const { toggleLaunchpad } = useAppStore();

    // TODO: 未来整合 windowStore 以显示动态打开的非固定应用

    return (
        <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-center pointer-events-none">
            {/* Dock Container */}
            <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-2 flex items-center gap-2 pointer-events-auto">

                {pinnedApps.map((app, index) => {
                    // 简单的缩放效果计算
                    const isHovered = hoveredIndex === index;
                    const isNeighbor = hoveredIndex !== null && Math.abs(hoveredIndex - index) === 1;

                    let scaleClass = "scale-100";
                    let marginClass = "mx-0";

                    if (isHovered) {
                        scaleClass = "scale-125 -translate-y-2";
                        marginClass = "mx-2";
                    } else if (isNeighbor) {
                        scaleClass = "scale-110 -translate-y-1";
                        marginClass = "mx-1";
                    }

                    const isActive = location.pathname === app.path || location.pathname.startsWith(app.path !== '/' ? app.path : '$$$');

                    return (
                        <Tooltip key={app.id} title={app.label} placement="top" mouseEnterDelay={0.1}>
                            <div
                                className={`relative group cursor-pointer transition-all duration-200 ease-out origin-bottom ${scaleClass} ${marginClass}`}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() => navigate(app.path)}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform ${app.color} group-hover:shadow-md ${isActive ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                                    {app.icon}
                                </div>
                                {/* Active Indicator point */}
                                {isActive && (
                                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-gray-800 rounded-full" />
                                )}
                            </div>
                        </Tooltip>
                    );
                })}

                {/* Divider for system tray area (future expansion) */}
                <div className="w-px h-10 bg-gray-300/50 mx-1 rounded-full"></div>

                {/* Launchpad Icon */}
                <Tooltip title="应用抽屉" placement="top">
                    <div
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50 flex flex-wrap content-center justify-center gap-[2px] cursor-pointer hover:bg-gray-100 transition-colors shadow-sm ml-1 hover:-translate-y-1 duration-200"
                        onClick={() => toggleLaunchpad()}
                    >
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="w-2.5 h-2.5 bg-gray-400 rounded-sm"></div>
                        ))}
                    </div>
                </Tooltip>
            </div>
        </div>
    );
};

export default Taskbar;
