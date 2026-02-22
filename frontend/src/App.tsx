
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Workbench from './pages/Workbench';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Workbench />} />
          {/* add more routes here later */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
