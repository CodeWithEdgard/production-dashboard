
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import LoginPage from '../pages/LoginPage';

// Um componente placeholder para nosso futuro dashboard
function DashboardPage() {
  return <h2>Dashboard (Página Protegida)</h2>;
}

function App() {
  return (
    <Router>
      <div>
        { /* Futuramente, o menu de navegação pode vir aqui */ }
      </div>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* A rota raiz pode redirecionar para o login ou para o dashboard */}
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </Router>
  )
}

export default App