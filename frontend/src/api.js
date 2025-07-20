// frontend/src/api.js

import axios from 'axios';

// --- A LÓGICA INTELIGENTE ESTÁ AQUI ---

// Vite expõe as variáveis de ambiente no objeto 'import.meta.env'.
// Tentamos ler a VITE_API_URL. Se ela não existir (desenvolvimento local),
// usamos 'http://localhost:8000/api' como padrão.
const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Esta linha é para debug. Verifique o console do navegador.
console.log(`API Base URL está configurada para: ${apiURL}`);

// Cria a instância do axios usando a URL CORRETA para o ambiente.
const apiClient = axios.create({
  baseURL: apiURL,
});


// --- O RESTO DO SEU CÓDIGO PERMANECE IGUAL ---

export const getRecebimentos = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.page) params.append('page', filters.page);
  if (filters.isClientMaterial && filters.isClientMaterial !== 'all') {
    params.append('is_client_material', filters.isClientMaterial);
  }
  
  console.log("FRONTEND: Buscando com os parâmetros:", params.toString());
  const response = await apiClient.get('/recebimentos/', { params });
  return response.data;
};

// Mudei FormData para formData para seguir a convenção
export const createRecebimento = async (formData) => {
  console.log("FRONTEND: Enviando novo recebimento...", formData);
  const response = await apiClient.post('/recebimentos/', formData);
  return response.data;
}

export const updateRecebimento = async ({ id, data }) => {
  console.log(`FRONTEND: Atualizando recebimento ID ${id}...`, data);
  const response = await apiClient.put(`/recebimentos/${id}`, data);
  return response.data;
};

export const resolveRecebimento = async ({ id, data }) => {
  console.log(`FRONTEND: Resolvendo pendência ID ${id}...`, data);
  const response = await apiClient.post(`/recebimentos/${id}/resolve`, data);
  return response.data;
};

export const rejectRecebimentoEntry = async ({ id, data }) => {
  console.log(`FRONTEND: Rejeitando entrada ID ${id}...`, data);
  const response = await apiClient.put(`/recebimentos/${id}/reject`, data);
  return response.data;
};