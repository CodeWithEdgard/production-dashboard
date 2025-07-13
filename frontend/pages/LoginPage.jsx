// src/pages/LoginPage.jsx

import React, { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

// Imports da MUI
import {
  Button,
  TextField,
  Container,
  Typography,
  Box,
  Paper,
  Avatar,
  Link,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"; // Um ícone legal para o topo

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Estado de loading para o botão
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Login bem-sucedido!");
      navigate("/dashboard"); // Redireciona após sucesso
    } catch (err) {
      console.error("Erro no login:", err);
      toast.error(err.response?.data?.detail || "Email ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      {" "}
      {/* maxWidth="xs" cria uma caixa de formulário estreita e centralizada */}
      <Paper
        elevation={6}
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          borderRadius: 2,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Entrar no Painel
        </Typography>

        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Endereço de Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Senha"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading} // Desabilita o botão enquanto carrega
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <Box textAlign="center">
            <Link component={RouterLink} to="/register" variant="body2">
              {"Não tem uma conta? Cadastre-se"}
            </Link>
          </Box>
        </Box>
      </Paper>
      {/* Rodapé da página de login */}
      <Typography
        variant="body2"
        color="text.secondary"
        align="center"
        sx={{ mt: 5 }}
      >
        {"Elak.Labs © by: Edgar Mendes "}
        {new Date().getFullYear()}
      </Typography>
    </Container>
  );
}

export default LoginPage;
