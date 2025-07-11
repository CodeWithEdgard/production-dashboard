
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth(); // Usa nosso hook para pegar o status

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  // Se estiver autenticado, renderiza o componente filho
  return children;
}

export default ProtectedRoute;