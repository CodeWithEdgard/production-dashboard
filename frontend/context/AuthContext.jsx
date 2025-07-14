
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../src/config/apiConfig';

// 1. Cria o Contexto
const AuthContext = createContext();

// Esta é a função que nossos componentes usarão para acessar o contexto
export function useAuth() {
  return useContext(AuthContext);
}

// 2. Cria o Provedor 
export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
  
  // Configura o Axios para incluir o token em todas as requisições
  useEffect(() => {
    if (authToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [authToken]);


  const login = async (email, password) => {
    
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await axios.post(`${API_URL}/login`, formData);
    const token = response.data.access_token;
    
    // Salva o token no estado e no localStorage
    setAuthToken(token);
    localStorage.setItem('token', token);
  };

  const logout = () => {
    // Remove o token do estado e do localStorage
    setAuthToken(null);
    localStorage.removeItem('token');
  };

  // Os valores que o provedor disponibilizará para toda a aplicação
  const value = {
    authToken,
    isAuthenticated: !!authToken, // Converte a string do token em um booleano 
    login,
    logout,
  };

  // 3. Renderiza os componentes filhos dentro do provedor
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}