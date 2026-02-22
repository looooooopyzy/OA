import React from 'react';
import { Card } from 'antd';
import { List, Users, Wallet, Trophy } from 'lucide-react';

const MetricsWidget: React.FC = () => {
    return (
        <div className="flex flex-col gap-4 h-full">
            <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2 m-0 h-[28px]">
                <div className="w-1.5 h-5 bg-blue-600 rounded-full"></div>
                关键指标视图
            </h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-4">
                <Card className="rounded-2xl shadow-sm border-none hover:shadow-md transition-shadow relative overflow-hidden" bodyStyle={{ padding: '20px' }}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                            <List size={24} />
                        </div>
                        <span className="text-green-500 text-sm font-medium bg-green-50 px-2 py-0.5 rounded-full">+12% &uarr;</span>
                    </div>
                    <div className="text-gray-500 text-sm mb-1">今日待审任务</div>
                    <div className="text-3xl font-bold text-gray-800">24</div>
                </Card>

                <Card className="rounded-2xl shadow-sm border-none hover:shadow-md transition-shadow" bodyStyle={{ padding: '20px' }}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                            <Users size={24} />
                        </div>
                        <span className="text-gray-400 text-xs mt-1">稳定</span>
                    </div>
                    <div className="text-gray-500 text-sm mb-1">部门出勤率</div>
                    <div className="text-3xl font-bold text-gray-800">98.2%</div>
                </Card>

                <Card className="rounded-2xl shadow-sm border-none hover:shadow-md transition-shadow" bodyStyle={{ padding: '20px' }}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                            <Wallet size={24} />
                        </div>
                        <span className="text-red-500 text-sm font-medium bg-red-50 px-2 py-0.5 rounded-full">-5.2% &darr;</span>
                    </div>
                    <div className="text-gray-500 text-sm mb-1">本月预算消耗</div>
                    <div className="text-3xl font-bold text-gray-800">&yen; 14,200</div>
                </Card>

                <Card className="rounded-2xl shadow-sm border-none hover:shadow-md transition-shadow" bodyStyle={{ padding: '20px' }}>
                    <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                            <Trophy size={24} />
                        </div>
                        <span className="text-green-500 text-sm font-medium bg-green-50 px-2 py-0.5 rounded-full">+3</span>
                    </div>
                    <div className="text-gray-500 text-sm mb-1">本周荣誉成就</div>
                    <div className="text-3xl font-bold text-gray-800">8</div>
                </Card>
            </div>
        </div>
    );
};

export default MetricsWidget;
