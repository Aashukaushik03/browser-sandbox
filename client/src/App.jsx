import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import IDEPage from './pages/IDEPage';

const Protected = ({ children }) => {
  const { token } = useStore();
  return token ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/project/:id" element={<Protected><IDEPage /></Protected>} />
      </Routes>
    </BrowserRouter>
  );
}
