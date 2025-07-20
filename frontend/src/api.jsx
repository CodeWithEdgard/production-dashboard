import axios from "axios";


const apiClient = axios.create({ baseURL: 'http://localhost:8000/api' })

export const getRecebimentos = async (filters = {}) => {
  // 1. Cria um objeto URLSearchParams. Ele cuidará de formatar a query string
  //    corretamente (ex: ?page=2&search=xyz).
  const params = new URLSearchParams();

  // 2. Adiciona os parâmetros APENAS se eles tiverem um valor.
  //    Evita enviar ?status=&search=
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.status) {
    params.append('status', filters.status);
  }
  if (filters.page && filters.page > 0) {
    params.append('page', filters.page);
  }
  if (filters.isClientMaterial && filters.isClientMaterial !== 'all') {
    params.append('is_client_material', filters.isClientMaterial);
  }
  
  console.log("FRONTEND: Buscando com os parâmetros:", params.toString());
  
  // 3. O axios anexa o objeto 'params' à URL da requisição.
  const response = await apiClient.get('/recebimentos/', { params });
  
  return response.data;
};

export const createRecebimento = async (FormData) => {
  console.log("FRONTEND: Enviando novo recebimento para o backend...", FormData)
  const response = await apiClient.post('/recebimentos', FormData)
  return response.data
}

export const updateRecebimento = async ({ id, data }) => {
  console.log(`FRONTEND: Atualizando recebimento ID ${id} com dados...`, data);
  // Faz uma chamada PUT para /api/recebimentos/{id}
  const response = await apiClient.put(`/recebimentos/${id}`, data);
  return response.data;
};

export const resolveRecebimento = async ({ id, data }) => {
  console.log(`FRONTEND: Resolvendo pendência do recebimento ID ${id}`, data);
  const response = await apiClient.post(`/recebimentos/${id}/resolve`, data);
  return response.data;
};

export const rejectRecebimentoEntry = async ({ id, data }) => {
  console.log(`FRONTEND: Rejeitando entrada do ID ${id}...`, data);
  const response = await apiClient.put(`/recebimentos/${id}/reject`, data);
  return response.data;
};