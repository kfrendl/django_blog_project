import { useState } from "react";
import axios from "axios";

function LoginForm({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/token/", {
        username,
        password,
      });
      setToken(response.data.access); // átadjuk a tokent a szülő komponensnek
      localStorage.setItem("accessToken", response.data.access);
      setError("");
    } catch (err) {
      setError("Hibás felhasználónév vagy jelszó");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Bejelentkezés</button>
      {error && <p>{error}</p>}
    </form>
  );
}

export default LoginForm;
