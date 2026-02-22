import React, { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

import MetricsWidget from './widgets/MetricsWidget';
import ProcessFormWidget from './widgets/ProcessFormWidget';
import ApprovalsWidget from './widgets/ApprovalsWidget';
import SuggestionWidget from './widgets/SuggestionWidget';

const ResponsiveGridLayout = WidthProvider(Responsive);

const Workbench: React.FC = () => {
    // 定义初始布局
    const initialLayout: Layout[] = [
        { i: 'metrics', x: 0, y: 0, w: 3, h: 4 },
        { i: 'form', x: 3, y: 0, w: 5, h: 4 },
        { i: 'approvals', x: 8, y: 0, w: 4, h: 3 },
        { i: 'suggestion', x: 8, y: 3, w: 4, h: 1 },
    ];

    const [layout, setLayout] = useState<Layout[]>(initialLayout);

    const onLayoutChange = (newLayout: Layout[]) => {
        setLayout(newLayout);
        // TODO: 可以将 newLayout 保存到后端接口或 LocalStorage，实现个性化布局记忆
        console.log('Layout changed:', newLayout);
    };

    return (
        <div className="w-full h-full relative">
            <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-xl font-bold text-gray-800 m-0">我的工作台</h2>
                <span className="text-sm text-gray-400">（拖拽卡片边缘即可自定义布局）</span>
            </div>

            <ResponsiveGridLayout
                className="layout"
                layouts={{ lg: layout }}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={150}
                onLayoutChange={onLayoutChange}
                isDraggable={true}
                isResizable={true}
                margin={[24, 24]}
            >
                <div key="metrics" className="bg-white rounded-2xl shadow-sm p-5 border border-gray-50 flex flex-col hover:shadow-md transition-shadow cursor-move overflow-hidden">
                    <MetricsWidget />
                </div>

                <div key="form" className="bg-white rounded-2xl shadow-sm p-1 border border-gray-50 flex flex-col hover:shadow-md transition-shadow cursor-move overflow-hidden">
                    <ProcessFormWidget />
                </div>

                <div key="approvals" className="bg-white rounded-2xl shadow-sm p-5 border border-gray-50 flex flex-col hover:shadow-md transition-shadow cursor-move overflow-hidden">
                    <ApprovalsWidget />
                </div>

                <div key="suggestion" className="cursor-move overflow-hidden">
                    <SuggestionWidget />
                </div>
            </ResponsiveGridLayout>
        </div>
    );
};

export default Workbench;
