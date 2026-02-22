import React from 'react';
import { Card, Badge } from 'antd';
import { FileText } from 'lucide-react';

const ApprovalsWidget: React.FC = () => {
    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex justify-between items-center h-[28px]">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 m-0">
                    <div className="w-1.5 h-5 bg-green-500 rounded-full"></div>
                    最近审批流水
                </h3>
                <a href="#" className="text-sm text-blue-600 flex items-center gap-1 hover:text-blue-500 transition-colors">查看全部 &rsaquo;</a>
            </div>

            <Card className="rounded-2xl shadow-sm border-none flex-1 overflow-y-auto custom-scrollbar" bodyStyle={{ padding: '0px' }}>
                <div className="grid grid-cols-12 text-xs text-gray-400 font-medium px-6 py-4 border-b border-gray-50 sticky top-0 bg-white z-10">
                    <div className="col-span-7">申请项目 / 发起人</div>
                    <div className="col-span-3 text-center">状态</div>
                    <div className="col-span-2 text-right">时间</div>
                </div>

                <div className="flex flex-col">
                    {[
                        { title: '年假申请', user: '王志远 · 研发部', status: '审批中', statusColor: 'warning', iconBg: 'bg-red-50', iconColor: 'text-red-400', time: '10:24 AM' },
                        { title: '采购电脑配件', user: '李雪 · 综合办', status: '已通过', statusColor: 'success', iconBg: 'bg-blue-50', iconColor: 'text-blue-400', time: '昨天' },
                        { title: '差旅费报销', user: '周星 · 销售部', status: '被驳回', statusColor: 'error', iconBg: 'bg-purple-50', iconColor: 'text-purple-400', time: '2月21日' },
                        { title: '加班核定申请', user: '张海 · 研发中心', status: '待我审', statusColor: 'processing', iconBg: 'bg-gray-100', iconColor: 'text-gray-500', time: '2月20日' },
                        { title: '外出公干申请', user: '吴明 · 市场部', status: '审批中', statusColor: 'warning', iconBg: 'bg-orange-50', iconColor: 'text-orange-400', time: '2月19日' },
                        { title: '办公用品申领', user: '林婷 · 人事部', status: '已通过', statusColor: 'success', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-400', time: '2月18日' },
                    ].map((item, idx) => (
                        <div key={idx} className="flex grid grid-cols-12 items-center px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer group">
                            <div className="col-span-7 flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex flex-shrink-0 items-center justify-center ${item.iconBg} ${item.iconColor} group-hover:scale-110 transition-transform`}>
                                    <FileText size={20} />
                                </div>
                                <div className="min-w-0">
                                    <div className="font-bold text-gray-800 text-sm mb-1 truncate">{item.title}</div>
                                    <div className="text-xs text-gray-400 truncate">{item.user}</div>
                                </div>
                            </div>
                            <div className="col-span-3 flex justify-center">
                                <Badge status={item.statusColor as any} text={<span className={`text-xs ${item.statusColor === 'warning' ? 'text-amber-500' : item.statusColor === 'success' ? 'text-green-500' : item.statusColor === 'error' ? 'text-red-500' : 'text-blue-500'} font-medium`}>{item.status}</span>} />
                            </div>
                            <div className="col-span-2 text-right text-xs text-gray-400 font-medium whitespace-nowrap">{item.time}</div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default ApprovalsWidget;
