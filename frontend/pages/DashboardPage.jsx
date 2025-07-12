// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// NOSSAS PÁGINAS E COMPONENTES
import { useAuth } from "../context/AuthContext";


const API_URL = "http://127.0.0.1:8000";

function DashboardPage() {
  // --- ESTADOS DO COMPONENTE ---
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Lista de ordens vinda da API
  const [orders, setOrders] = useState([]);

  // Estados para feedback ao usuário
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado para os dados do formulário
  const [formData, setFormData] = useState({
    obra_number: "",
    nro_op: "",
    // ... adicione aqui os outros campos com valores iniciais vazios
  });

  // Estado para controlar se estamos editando ou criando
  const [editingId, setEditingId] = useState(null);

  // --- FUNÇÕES DE INTERAÇÃO COM A API ---

  // 1. FUNÇÃO PARA BUSCAR TODAS AS ORDENS
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/orders/`);
      setOrders(response.data);
      setError("");
    } catch (err) {
      setError("Falha ao carregar as ordens.");
    } finally {
      setLoading(false);
    }
  };

  // 2. FUNÇÃO PARA CRIAR OU ATUALIZAR UMA ORDEM
  const handleFormSubmit = async (e) => {
  e.preventDefault(); // Impede o recarregamento da página

  // A URL e o método mudam se estamos editando ou criando
  const method = editingId ? 'put' : 'post';
  const url = editingId ? `${API_URL}/orders/${editingId}` : `${API_URL}/orders/`;

  try {
    // Envia a requisição para a API com os dados do estado 'formData'
    await axios[method](url, formData);

    // Mostra uma mensagem de sucesso
    alert(`Ordem ${editingId ? 'atualizada' : 'criada'} com sucesso!`);
    
    // Chama a função para limpar o formulário e resetar o modo de edição
    resetForm();
    
    // Chama a função para buscar e re-renderizar a lista de ordens
    fetchOrders();

  } catch (err) {
    console.error("Erro ao salvar ordem:", err);
    alert("Erro ao salvar a ordem.");
  }
};

  // 3. FUNÇÃO PARA DELETAR UMA ORDEM
  const handleDelete = async (orderId) => {
    if (
      window.confirm(
        `Tem certeza que deseja deletar a ordem com ID ${orderId}?`
      )
    ) {
      try {
        await axios.delete(`${API_URL}/orders/${orderId}`);
        alert("Ordem deletada com sucesso!");
        fetchOrders(); // Atualiza a lista
      } catch (err) {
        console.error("Erro ao deletar ordem:", err);
        alert("Erro ao deletar a ordem.");
      }
    }
  };

  // 4. FUNÇÃO PARA PREPARAR O FORMULÁRIO PARA EDIÇÃO
  const handleEdit = (order) => {
    setEditingId(order.id); // Define o ID que estamos editando
    setFormData({
      // Preenche o formulário com os dados da ordem clicada

      obra_number: order.obra_number,
      nro_op: order.nro_op,
      transf_potencia_status: order.transf_potencia_status,
      transf_corrente_status: order.transf_corrente_status,
      chave_secc_status: order.chave_secc_status,
      disjuntor_status: order.disjuntor_status,
      bucha_iso_raio_status: order.bucha_iso_raio_status,
      geral_status: order.geral_status,
      descricao: order.descricao || "", // Garante que não seja 'null'
      ca: order.ca || "",
      nobreak: order.nobreak || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" }); // Rola para o topo para ver o formulário
  };

  // --- FUNÇÕES AUXILIARES ---

  // Função para limpar o formulário e voltar ao modo de criação
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      obra_number: "",
      nro_op: "",
      transf_potencia_status: "pendente",
      transf_corrente_status: "pendente",
      chave_secc_status: "pendente",
      disjuntor_status: "pendente",
      bucha_iso_raio_status: "pendente",
      geral_status: "produção",
      descricao: "",
      ca: "",
      nobreak: "",
    });
  };

  // Função para lidar com a mudança nos campos do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  // useEffect: Busca os dados assim que o componente carrega
  useEffect(() => {
    fetchOrders();
  }, []);

  // --- RENDERIZAÇÃO DO JSX ---
  return (
    <div>
      <header>
        <h1>Painel de Produção</h1>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Sair
        </button>
      </header>
      <main>
        {/* --- Formulário --- */}
        <section>
          <h2>
            {editingId ? `Editando Ordem ID: ${editingId}` : "Criar Nova Ordem"}
          </h2>
          <form onSubmit={handleFormSubmit}>
            <input
              type="text"
              name="obra_number"
              value={formData.obra_number}
              onChange={handleInputChange}
              placeholder="Número da Obra"
              required
            />
            <input
              type="text"
              name="nro_op"
              value={formData.nro_op}
              onChange={handleInputChange}
              placeholder="NRO OP"
              required
            />

            {/* --- CAMPOS DE STATUS --- */}
            <input
              type="text"
              name="transf_potencia_status"
              value={formData.transf_potencia_status}
              onChange={handleInputChange}
              placeholder="Status Transf. Potência"
            />
            <input
              type="text"
              name="transf_corrente_status"
              value={formData.transf_corrente_status}
              onChange={handleInputChange}
              placeholder="Status Transf. Corrente"
            />
            <input
              type="text"
              name="chave_secc_status"
              value={formData.chave_secc_status}
              onChange={handleInputChange}
              placeholder="Status Chave Secc."
            />
            <input
              type="text"
              name="disjuntor_status"
              value={formData.disjuntor_status}
              onChange={handleInputChange}
              placeholder="Status Disjuntor"
            />
            <input
              type="text"
              name="bucha_iso_raio_status"
              value={formData.bucha_iso_raio_status}
              onChange={handleInputChange}
              placeholder="Status Bucha/Iso/Raio"
            />
            <input
              type="text"
              name="geral_status"
              value={formData.geral_status}
              onChange={handleInputChange}
              placeholder="Status Geral"
            />

            {/* --- OUTRAS INFORMAÇÕES --- */}
            <input
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              placeholder="Descrição"
            />
            <input
              type="text"
              name="ca"
              value={formData.ca}
              onChange={handleInputChange}
              placeholder="C.A"
            />
            <input
              type="text"
              name="nobreak"
              value={formData.nobreak}
              onChange={handleInputChange}
              placeholder="Nobreak"
            />

            {/* Repita o padrão acima para TODOS os outros campos da ordem */}

            <button type="submit">
              {editingId ? "Salvar Alterações" : "Adicionar Ordem"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm}>
                Cancelar Edição
              </button>
            )}
          </form>
        </section>

        {/* --- Tabela --- */}
        <section>
          <h2>Ordens de Produção</h2>
          {loading && <p>Carregando...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!loading && !error && (
            <table>
              <thead>
                <tr>
                  <th>Obra</th>
                  <th>NRO OP</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.obra_number}</td>
                    <td>{order.nro_op}</td>
                    <td>{order.geral_status}</td>
                    <td>
                      <button onClick={() => handleEdit(order)}>
                        ✏️ Editar
                      </button>
                      <button onClick={() => handleDelete(order.id)}>
                        🗑️ Deletar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
