import React from 'react';
import { Route } from 'react-router-dom';

// 使用 import.meta.glob 记录所有插件中的页面组件
const pluginPages = import.meta.glob('../plugins/**/pages/*.tsx');

/**
 * 将所有检测到的插件页面转换为 React Router v6 路由。
 * 默认映射规则：
 * src/plugins/{pluginName}/pages/{PageName}.tsx 
 * 映射为路由路径 /plugins/{pluginName}/{pagename}
 */
export function generatePluginRoutes() {
    return Object.keys(pluginPages).map((filePath) => {
        // match[1]: pluginName, match[2]: PageName
        const match = filePath.match(/\.\.\/plugins\/(.*)\/pages\/(.*)\.tsx$/);
        if (!match) return null;

        const pluginName = match[1];
        const pageName = match[2].toLowerCase();

        // 生成的路径如 'plugins/announcement/list'
        const routePath = `plugins/${pluginName}/${pageName}`;

        // 懒加载该组件
        const Component = React.lazy(pluginPages[filePath] as any);

        return (
            <Route
                key={routePath}
                path={routePath}
                element={
                    <React.Suspense fallback={<div className="p-8">模块加载中...</div>}>
                        <Component />
                    </React.Suspense>
                }
            />
        );
    }).filter(Boolean);
}
