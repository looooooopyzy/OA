import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import AuthGuard from '@/components/AuthGuard';
import DashboardLayout from '@/layouts/DashboardLayout';
import LoginPage from '@/pages/Login';
import Workbench from '@/pages/Workbench';

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
          {/* 后续路由将在此扩展 */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
