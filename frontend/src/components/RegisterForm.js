// frontend/src/components/RegisterForm.js

import { useState } from "react";
import axios from "axios";

// VÁLTOZÁS: Hozzáadva az onCancel prop
function RegisterForm({ onSuccessfulRegister, onCancel }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (username.length < 5 || password.length < 5 || email.length < 5) {
      setError("A felhasználónév, e-mail és jelszó minimum 5 karakter legyen.");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/register/", {
        username,
        email,
        password,
      });
      
      setMessage("Sikeres regisztráció! Most már bejelentkezhetsz.");
      setUsername("");
      setEmail("");
      setPassword("");

      if (onSuccessfulRegister) {
        onSuccessfulRegister(); 
      }
    } catch (err) {
      if (err.response && err.response.data) {
        let errorMsg = "Hiba a regisztráció közben.";
        if (err.response.data.username) {
            errorMsg = `Felhasználónév hiba: ${err.response.data.username[0]}`;
        } else if (err.response.data.email) {
            errorMsg = `E-mail hiba: ${err.response.data.email[0]}`;
        } else if (err.response.data.password) {
            errorMsg = `Jelszó hiba: ${err.response.data.password[0]}`;
        }
        setError(errorMsg);
      } else {
        setError("Ismeretlen hiba történt a szerveren.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Registration</h2>

        {error && (
          <p className="text-red-500 mb-4 text-center font-medium">{error}</p>
        )}
        {message && (
          <p className="text-green-500 mb-4 text-center font-medium">{message}</p>
        )}

        {/* ... (Username, Email, Password input mezők) ... */}
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Username</label>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Password</label>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
        </div>
        {/* ... (input mezők vége) ... */}


        <div className="flex justify-between items-center mt-4">
            {/*Vissza gomb hozzáadása */}
            {onCancel && (
                <button
                  type="button"
                  onClick={onCancel} 
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold rounded transition"
                >
                  Back to login
                </button>
            )}
            
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition ml-auto"
            >
              Register
            </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;