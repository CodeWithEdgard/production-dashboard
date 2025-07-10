
import React, {useState} from "react";
import axios from 'axios'

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // Previne o recarregamento da página
    setError('');

    // A URL completa da nossa API.
    const API_URL = "http://127.0.0.1:8000";

    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await axios.post(`${API_URL}/login`, formData);

      console.log("Login bem-sucedido!", response.data);
      alert("Login bem-sucedido! Token: " + response.data.access_token);
    } catch (err) {
      setError("Email ou senha incorretos.");
      console.log("Erro no login: ", err);
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
