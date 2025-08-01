import axios from "axios";

const apiURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Esta linha é para debug. Verifique o console do navegador.
console.log(`API Base URL está configurada para: ${apiURL}`);

// Cria a instância do axios usando a URL CORRETA para o ambiente.
const apiClient = axios.create({
  baseURL: apiURL,
});

export const getRecebimentos = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.status) params.append("status", filters.status);
  if (filters.page) params.append("page", filters.page);
  if (filters.isClientMaterial && filters.isClientMaterial !== "all") {
    params.append("is_client_material", filters.isClientMaterial);
  }

  console.log("FRONTEND: Buscando com os parâmetros:", params.toString());
  const response = await apiClient.get("/recebimentos/", { params });
  return response.data;
};

export const createRecebimento = async (formData) => {
  console.log("FRONTEND: Enviando novo recebimento...", formData);
  const response = await apiClient.post("/recebimentos/", formData);
  return response.data;
};

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

// --- FUNÇÕES PARA O MÓDULO C.A. ---

export const getComunicadosAlteracao = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.page) params.append("page", filters.page);

  console.log(
    "FRONTEND: Buscando Comunicados de Alteração com filtros:",
    params.toString()
  );
  const response = await apiClient.get("/ca/", { params }); // Note o endpoint /api/ca/
  return response.data;
};

export const createComunicadoAlteracao = async (caData) => {
  console.log("FRONTEND: Criando novo C.A...", caData);
  const response = await apiClient.post("/ca/", caData);
  return response.data;
};

export const getComunicadoAlteracaoById = async (caId) => {
  console.log(`FRONTEND: Buscando C.A. específico com ID: ${caId}`);
  const response = await apiClient.get(`/ca/${caId}`);
  return response.data;
};

export const updateItemStockStatus = async ({ itemId, status }) => {
  console.log(`FRONTEND: Atualizando status do item ${itemId} para ${status}`);
  const response = await apiClient.put(`/ca/items/${itemId}/stock-status`, {
    stock_status: status,
  });
  return response.data;
};

// A função createStockMovement também será necessária, então vamos criá-la
export const createStockMovement = async (movementData) => {
  console.log("FRONTEND: Registrando novo movimento de estoque...");
  const response = await apiClient.post("/ca/movements", movementData);
  return response.data;
};

export const createRequisition = async (requisitionData) => {
  console.log("FRONTEND: Criando nova requisição...", requisitionData);
  const response = await apiClient.post("/requisitions/", requisitionData);
  return response.data;
};

export const getPendingRequisitions = async () => {
  console.log("FRONTEND: Buscando requisições pendentes...");
  const response = await apiClient.get("/requisitions/pending");
  return response.data;
};

export const fulfillRequisition = async (requisitionId) => {
  console.log(`FRONTEND: Finalizando a requisição ID ${requisitionId}...`);
  const response = await apiClient.put(
    `/requisitions/${requisitionId}/fulfill`
  );
  return response.data;
};
