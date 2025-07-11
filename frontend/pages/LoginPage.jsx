
import React, {useState} from "react";
import axios from 'axios'
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Previne o recarregamento da página

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError("Email ou senha incorretos.");
    }

  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit= {handleLogin}>
        <div>
          <label>Email:</label>
          <input type="email"  value={email} onChange={(e) => setEmail(e.target.value)} required/>
        </div>

        <div>
          <label>Senha:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit">Entrar</button>
      </form>

      {error && <p style={{ color: 'red'}} > {error}</p>}
    </div>
  );
}

export default LoginPage;
