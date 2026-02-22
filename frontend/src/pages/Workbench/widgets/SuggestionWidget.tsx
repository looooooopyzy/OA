import React from 'react';
import { BulbOutlined } from '@ant-design/icons';

const SuggestionWidget: React.FC = () => {
    return (
        <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 rounded-2xl p-5 border border-blue-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-400/20 transition-all"></div>
            <h4 className="flex items-center gap-2 font-bold text-gray-800 mb-3 text-sm">
                <BulbOutlined className="text-blue-500 text-lg" />
                智能建议
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed font-medium m-0 relative z-10">
                系统检测到你有 4 个待处理的财务报销单已积压超过 48 小时，建议优先处理以保证部门预算流转。
            </p>
        </div>
    );
};

export default SuggestionWidget;
