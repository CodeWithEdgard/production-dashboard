
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate} from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';

// Um componente placeholder para nosso futuro dashboard
function DashboardPage() {
  const { logout } = useAuth();
  return (
    <div>
      <h2>Dashboard (Pagina Protegida)</h2>
      <button onClick={logout}>Sair (Logout)</button>
    </div>
  )
}

function Home() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
          />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  )
}

export default App