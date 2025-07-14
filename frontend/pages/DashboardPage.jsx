// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  TextField,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
} from "@mui/material";
import {
  AppBar,
  Toolbar,
  Collapse,
  IconButton,
  CssBaseline,
  Tooltip,
} from "@mui/material";

import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import StatusBadge from "../components/StatusBadge";
import { API_URL } from '../src/config/apiConfig';

import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";


const statusOptions = [
  "entregue",
  "pendente recebimento",
  "aguardando entrada",
  "troca entre obras",
  "N/A",
];

const statusProd = ["estrutura", "produção", "expedição"];

function DashboardPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const ORDERS_PER_PAGE = 10;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [expandedRowId, setExpandedRowId] = useState(null);

  const initialFormData = {
    obra_number: "",
    nro_op: "",
    transf_potencia_status: "pendente",
    transf_corrente_status: "pendente",
    chave_secc_status: "pendente",
    disjuntor_status: "pendente",
    bucha_iso_raio_status: "pendente",
    geral_status: "produção",
    descricao: "",
    ca_r167: "",
    nobreak: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  // --- FUNÇÕES DE API ---
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const skip = currentPage * ORDERS_PER_PAGE;
      let url = `${API_URL}/orders/?skip=${skip}&limit=${ORDERS_PER_PAGE}`;

      // Se houver um termo de busca, adiciona-o como parâmetro de query
      if (searchTerm) {
        // Inteligência para decidir se busca por obra ou op
        // (assume que OP geralmente tem letras e obra só números, mas pode ser melhorado)
        if (isNaN(searchTerm)) {
          url += `&nro_op=${searchTerm}`;
        } else {
          url += `&obra_number=${searchTerm}`;
        }
      }

      const response = await axios.get(url);
      setOrders(response.data);
      setError("");
    } catch (err) {
      // ... (código de erro)
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const method = editingId ? "put" : "post";
    const url = editingId
      ? `${API_URL}/orders/${editingId}`
      : // O endpoint de criação é só /orders/
        `${API_URL}/orders/`;

    try {
      await axios[method](url, formData);
      toast.success(
        `Ordem ${editingId ? "atualizada" : "criada"} com sucesso!`
      );

      handleCloseModal(); // Fecha o modal

      // Se estava editando, apenas recarrega os dados.
      // Se estava criando, volta para a primeira página para ver o novo item.
      if (!editingId && currentPage !== 0) {
        setCurrentPage(0);
      } else {
        fetchOrders();
      }
    } catch (err) {
      console.error("Erro ao salvar ordem:", err);
      toast.error(err.response?.data?.detail || "Erro ao salvar a ordem.");
    }
  };

  const handleDelete = async (orderId) => {
    if (
      window.confirm(
        `Tem certeza que deseja deletar a ordem com ID ${orderId}?`
      )
    ) {
      try {
        await axios.delete(`${API_URL}/orders/${orderId}`);
        toast.success("Ordem deletada com sucesso!");
        fetchOrders();
      } catch (err) {
        console.error("Erro ao deletar ordem:", err);
        toast.error("Erro ao deletar a ordem.");
      }
    }
  };

  const handleOpenEditModal = (order) => {
    setEditingId(order.id);
    setFormData({
      obra_number: order.obra_number,
      nro_op: order.nro_op,
      transf_potencia_status: order.transf_potencia_status,
      transf_corrente_status: order.transf_corrente_status,
      chave_secc_status: order.chave_secc_status,
      disjuntor_status: order.disjuntor_status,
      bucha_iso_raio_status: order.bucha_iso_raio_status,
      geral_status: order.geral_status,
      descricao: order.descricao || "",
      nobreak: order.nobreak || "",
    });
    setIsModalOpen(true);
  };

  // --- FUNÇÕES AUXILIARES ---

  const handleRowClick = (orderId) => {
    // Se a linha clicada já estiver aberta, fecha. Senão, abre a nova linha.
    const newExpandedRowId = expandedRowId === orderId ? null : orderId;
    setExpandedRowId(newExpandedRowId);
  };

  const handleOpenModal = () => {
    resetForm(); // Limpa o formulário antes de abrir para garantir que está no modo "criar"
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };
  const resetForm = () => {
    setEditingId(null);
    setFormData(initialFormData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const goToNextPage = () => {
    if (orders.length === ORDERS_PER_PAGE) setCurrentPage((p) => p + 1);
  };
  const goToPreviousPage = () => {
    setCurrentPage((p) => Math.max(0, p - 1));
  };

  // useEffect 1: Controla o "debounce" da busca
  // Assiste o 'searchTerm' que o usuário digita
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms de atraso

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]); // Roda APENAS quando o 'searchTerm' do input muda

  // useEffect 2: Busca os dados da API
  // Assiste o 'debouncedSearchTerm' e a 'currentPage'
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let url = `${API_URL}/orders/?skip=${
          currentPage * ORDERS_PER_PAGE
        }&limit=${ORDERS_PER_PAGE}`;

        // Agora usamos o termo com atraso para a busca
        if (debouncedSearchTerm) {
          if (isNaN(debouncedSearchTerm)) {
            url += `&nro_op=${debouncedSearchTerm}`;
          } else {
            url += `&obra_number=${debouncedSearchTerm}`;
          }
        }
        const response = await axios.get(url);
        setOrders(response.data);
        setError("");
      } catch (err) {
        console.error("Erro ao buscar ordens:", err);
        setError("Falha ao carregar as ordens.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [debouncedSearchTerm, currentPage]);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <CssBaseline /> {/* Aplica o reset de CSS */}
      {/* =================================
          1. CABEÇALHO (AppBar)
       ================================= */}
      <AppBar position="static" sx={{ flexShrink: 0 }}>
        <Toolbar>
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }}>
            Elak Labs
          </Typography>

          {/* --- Links de Navegação --- */}
          <Box sx={{ display: { xs: "none", md: "flex" }, mr: 2 }}>
            {" "}
            {/* Esconde em telas pequenas */}
            <Button component={Link} to="/receiving" color="inherit">
              Recebimento
            </Button>
            <Button component={Link} to="/dashboard" color="inherit">
              Separação Mat.
            </Button>
            <Button component={Link} to="/users-management" color="inherit">
              Requisição Mat.
            </Button>
            <Button component={Link} to="/users-management" color="inherit">
              Comunicado Alt.
            </Button>
            <Button component={Link} to="/users-management" color="inherit">
              RNC
            </Button>
          </Box>

          {/* --- Botão de Sair --- */}
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            sx={{ borderColor: "rgba(255, 255, 255, 0.5)" }} // Borda sutil
          >
            Sair
          </Button>
        </Toolbar>
      </AppBar>
      {/* =================================
          2. CONTEÚDO PRINCIPAL (Main)
       ================================= */}
      <Box
        component="main"
        sx={{
          flexGrow: 1, // Faz esta área crescer para ocupar o espaço
          overflowY: "auto", // Adiciona rolagem vertical apenas aqui
          p: 3,
          backgroundColor: "#f4f6f8", // Fundo cinza claro para o conteúdo
        }}
      >
        <Container maxWidth="xl">
          {/* --- MODAL PARA CRIAR/EDITAR --- */}

          <Dialog
            open={isModalOpen}
            onClose={handleCloseModal}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>
              {editingId
                ? `Editando Ordem ID: ${editingId}`
                : "Criar Nova Ordem"}
            </DialogTitle>
            <DialogContent>
              {/* O FORMULÁRIO AGORA VIVE DENTRO DO MODAL */}
              <Box
                component="form"
                id="order-form"
                onSubmit={handleFormSubmit}
                sx={{ pt: 1 }}
              >
                {/* Stack é um container Flexbox unidimensional. Perfeito para formulários! */}
                <Stack spacing={2}>
                  {/* Campo 1 */}
                  <TextField
                    label="Número da Obra"
                    name="obra_number"
                    value={formData.obra_number}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />

                  {/* Campo 2 */}
                  <TextField
                    label="NRO OP"
                    name="nro_op"
                    value={formData.nro_op}
                    onChange={handleInputChange}
                    fullWidth
                    required
                  />

                  {/* Agora, os menus dropdown. Usaremos a mesma abordagem um por linha */}

                  <FormControl fullWidth>
                    <InputLabel>Status T. Potência</InputLabel>
                    <Select
                      label="Status T. Potência"
                      name="transf_potencia_status"
                      value={formData.transf_potencia_status}
                      onChange={handleInputChange}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Status T. Corrente</InputLabel>
                    <Select
                      label="Status T. Corrente"
                      name="transf_corrente_status"
                      value={formData.transf_corrente_status}
                      onChange={handleInputChange}
                    >
                      {statusOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Chave Secc.</InputLabel>
                    <Select
                      name="chave_secc_status"
                      label="Chave Secc."
                      value={formData.chave_secc_status}
                      onChange={handleInputChange}
                    >
                      {statusOptions.map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Disjuntor</InputLabel>
                    <Select
                      name="disjuntor_status"
                      label="Disjuntor"
                      value={formData.disjuntor_status}
                      onChange={handleInputChange}
                    >
                      {statusOptions.map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Bucha/Iso</InputLabel>
                    <Select
                      name="bucha_iso_raio_status"
                      label="Bucha/Iso"
                      value={formData.bucha_iso_raio_status}
                      onChange={handleInputChange}
                    >
                      {statusOptions.map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Status Geral</InputLabel>
                    <Select
                      name="geral_status"
                      label="Status Geral"
                      value={formData.geral_status}
                      onChange={handleInputChange}
                    >
                      {statusProd.map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* --- Outros Campos --- */}

                  <FormControl fullWidth>
                    <InputLabel>Nobreak</InputLabel>
                    <Select
                      name="nobreak"
                      label="Nobreak"
                      value={formData.nobreak}
                      onChange={handleInputChange}
                    >
                      {statusOptions.map((o) => (
                        <MenuItem key={o} value={o}>
                          {o}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* <TextField
                  label="C.A"
                  name="ca_r167"
                  value={formData.ca_r167}
                  onChange={handleInputChange}
                  fullWidth
                /> */}

                  <TextField
                    label="Descrição"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    fullWidth
                    multiline
                    rows={3}
                  />
                </Stack>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseModal}>Cancelar</Button>
              <Button type="submit" form="order-form" variant="contained">
                {editingId ? "Salvar Alterações" : "Adicionar Ordem"}
              </Button>
            </DialogActions>
          </Dialog>

          {/* --- Bloco de Ações da Página --- */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h4" component="h1">
              Separação de Materiais
            </Typography>
            <Button variant="contained" onClick={handleOpenModal}>
              + Adicionar Ordem
            </Button>
          </Box>

          {/* --- Barra de Busca --- */}
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Pesquisar por Nº Obra ou NRO OP"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Paper>

          {/* --- TABELA  --- */}
          <Paper elevation={2}>
            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            )}
            {!error && !loading && (
              <TableContainer component={Paper}>
                <Table size="small" aria-label="production-orders-table">
                  <TableHead>
                    <TableRow
                      sx={{
                        // Adiciona uma cor de fundo suave ao cabeçalho
                        "& th": {
                          backgroundColor: "grey.100", // Um cinza bem claro
                          fontWeight: "bold", // Deixa o texto em negrito
                          borderBottom: "2px solid", // Uma borda inferior mais grossa
                          borderColor: "grey.300",
                        },
                      }}
                    >
                      <TableCell sx={{ width: "5%" }} />
                      <TableCell sx={{ width: "15%" }}>OBRA</TableCell>
                      <TableCell sx={{ width: "15%" }}>NRO OP</TableCell>
                      <TableCell>STATUS GERAL</TableCell>
                      <TableCell>CRIADO POR</TableCell>
                      <TableCell>ÚLTIMA MODIFICAÇÃO</TableCell>
                      <TableCell align="right" sx={{ width: "20%" }}>
                        AÇÕES
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => {
                      const isExpanded = expandedRowId === order.id;
                      return (
                        <React.Fragment key={order.id}>
                          {/* LINHA PRINCIPAL - RESUMIDA */}
                          <TableRow
                            sx={{ "& > *": { borderBottom: "unset" } }}
                            hover
                          >
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() => handleRowClick(order.id)}
                              >
                                {isExpanded ? (
                                  <KeyboardArrowUpIcon />
                                ) : (
                                  <KeyboardArrowDownIcon />
                                )}
                              </IconButton>
                            </TableCell>
                            <TableCell>{order.obra_number}</TableCell>

                            <TableCell>{order.nro_op}</TableCell>

                            <TableCell>
                              <Box
                                component="span"
                                sx={{
                                  // Lógica para definir a cor de fundo baseada no status
                                  bgcolor:
                                    order.geral_status === "produção"
                                      ? "primary.main"
                                      : order.geral_status === "estrutura"
                                      ? "warning.main"
                                      : order.geral_status === "concluido"
                                      ? "success.main"
                                      : "grey.500", // Uma cor padrão para outros status
                                  color: "white", // Cor do texto
                                  px: 1.5, // Padding horizontal
                                  py: 0.5, // Padding vertical
                                  borderRadius: "12px", // Bordas arredondadas
                                  fontSize: "0.75rem", // Tamanho da fonte
                                  fontWeight: "bold", // Fonte em negrito
                                }}
                              >
                                {order.geral_status}
                              </Box>
                            </TableCell>

                            <TableCell>
                              {order.owner ? order.owner.email : "N/A"}
                            </TableCell>

                            <TableCell>
                              {new Date(order.updated_at).toLocaleString(
                                "pt-BR"
                              )}
                              {order.last_updated_by && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  component="div"
                                >
                                  by: {order.last_updated_by.email}
                                </Typography>
                              )}
                            </TableCell>

                            <TableCell align="right">
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => handleOpenEditModal(order)}
                                >
                                  Editar
                                </Button>

                                <Button
                                  variant="outlined"
                                  color="error"
                                  size="small"
                                  onClick={() => handleDelete(order.id)}
                                >
                                  Deletar
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>

                          {/* LINHA EXPANSÍVEL - DETALHES */}
                          <TableRow>
                            <TableCell
                              style={{ paddingBottom: 0, paddingTop: 0 }}
                              colSpan={7}
                            >
                              <Collapse
                                in={isExpanded}
                                timeout="auto"
                                unmountOnExit
                              >
                                {/* Este Box é o container principal que resolve o problema do fundo */}
                                <Box
                                  sx={{
                                    margin: 1,
                                    padding: 2,
                                    backgroundColor: "rgba(0, 0, 0, 0.02)", // Um cinza quase branco, muito sutil
                                    borderTop: "1px solid",
                                    borderColor: "divider",
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    gutterBottom
                                    component="div"
                                    sx={{ fontWeight: "bold" }}
                                  >
                                    Detalhes da Ordem #{order.id}
                                  </Typography>

                                  {/* --- TABELA DE STATUS E DETALHES --- */}
                                  <Table size="small" sx={{ mb: 2 }}>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell
                                          sx={{ fontWeight: "bold", border: 0 }}
                                        >
                                          T. Potência:
                                        </TableCell>
                                        <TableCell sx={{ border: 0 }}>
                                          <StatusBadge
                                            status={
                                              order.transf_potencia_status
                                            }
                                          />
                                        </TableCell>
                                        <TableCell
                                          sx={{ fontWeight: "bold", border: 0 }}
                                        >
                                          Nobreak:
                                        </TableCell>
                                        <TableCell sx={{ border: 0 }}>
                                          {order.nobreak || "N/A"}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell
                                          sx={{ fontWeight: "bold", border: 0 }}
                                        >
                                          T. Corrente:
                                        </TableCell>
                                        <TableCell sx={{ border: 0 }}>
                                          <StatusBadge
                                            status={
                                              order.transf_corrente_status
                                            }
                                          />
                                        </TableCell>
                                        <TableCell
                                          sx={{ fontWeight: "bold", border: 0 }}
                                        >
                                          Data de Criação:
                                        </TableCell>
                                        <TableCell sx={{ border: 0 }}>
                                          {new Date(
                                            order.created_at
                                          ).toLocaleString("pt-BR")}
                                        </TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell
                                          sx={{ fontWeight: "bold", border: 0 }}
                                        >
                                          Chave Secc.:
                                        </TableCell>
                                        <TableCell sx={{ border: 0 }}>
                                          <StatusBadge
                                            status={order.chave_secc_status}
                                          />
                                        </TableCell>
                                        <TableCell
                                          sx={{ fontWeight: "bold", border: 0 }}
                                        ></TableCell>
                                        <TableCell
                                          sx={{ border: 0 }}
                                        ></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell
                                          sx={{ fontWeight: "bold", border: 0 }}
                                        >
                                          Disjuntor:
                                        </TableCell>
                                        <TableCell sx={{ border: 0 }}>
                                          <StatusBadge
                                            status={order.disjuntor_status}
                                          />
                                        </TableCell>
                                        <TableCell
                                          sx={{ fontWeight: "bold", border: 0 }}
                                        ></TableCell>
                                        <TableCell
                                          sx={{ border: 0 }}
                                        ></TableCell>
                                      </TableRow>
                                      <TableRow>
                                        <TableCell
                                          sx={{ fontWeight: "bold", border: 0 }}
                                        >
                                          Bucha/Iso:
                                        </TableCell>
                                        <TableCell sx={{ border: 0 }}>
                                          <StatusBadge
                                            status={order.bucha_iso_raio_status}
                                          />
                                        </TableCell>
                                        <TableCell
                                          sx={{ fontWeight: "bold", border: 0 }}
                                        ></TableCell>
                                        <TableCell
                                          sx={{ border: 0 }}
                                        ></TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>

                                  {/* --- DESCRIÇÃO --- */}
                                  <Typography variant="body2" sx={{ mt: 1 }}>
                                    <strong>Descrição:</strong>{" "}
                                    {order.descricao || "Nenhuma"}
                                  </Typography>
                                </Box>
                              </Collapse>
                            </TableCell>
                          </TableRow>
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* --- Paginação --- */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2, p: 2 }}>
            <Button onClick={goToPreviousPage} disabled={currentPage === 0}>
              Anterior
            </Button>
            <Typography sx={{ mx: 2, alignSelf: "center" }}>
              Página {currentPage + 1}
            </Typography>
            <Button
              onClick={goToNextPage}
              disabled={orders.length < ORDERS_PER_PAGE}
            >
              Próxima
            </Button>
          </Box>
        </Container>
      </Box>
      {/* =================================
          3. RODAPÉ (Footer)
       ================================= */}
      <Box
        component="footer"
        sx={{
          flexShrink: 0, // Impede que o rodapé encolha
          p: 1.5,
          textAlign: "center",
          backgroundColor: "grey.200",
          borderTop: "1px solid",
          borderColor: "grey.300",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Elak Labs © {new Date().getFullYear()} | Desenvolvido por:
          <Link
            href="https://www.linkedin.com/in/codewithedgard/"
            target="_blank"
            sx={{ ml: 0.5, fontWeight: "bold" }}
          >
            Edgar Mendes
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}

export default DashboardPage;
