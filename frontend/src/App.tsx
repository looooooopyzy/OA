import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/Login';
import Workbench from '@/pages/Workbench';
import UserManagement from '@/pages/System/Users';
import RoleManagement from '@/pages/System/Roles';
import DepartmentManagement from '@/pages/System/Departments';
import MenuManagement from '@/pages/System/Menus';
import { generatePluginRoutes } from '@/router/DynamicRouter';

function App() {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  // 应用启动时尝试用 localStorage 中的 Token 恢复会话
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 登录页 - 无需鉴权 */}
        <Route path="/login" element={<LoginPage />} />

        {/* 受保护的路由 */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <DashboardLayout />
            </AuthGuard>
          }
        >
          <Route index element={<Workbench />} />
          <Route path="system/users" element={<UserManagement />} />
          <Route path="system/roles" element={<RoleManagement />} />
          <Route path="system/departments" element={<DepartmentManagement />} />
          <Route path="system/menus" element={<MenuManagement />} />

          {/* 插件系统动态挂载区域 */}
          {generatePluginRoutes()}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
