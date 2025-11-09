import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import RegisterForm from "./components/RegisterForm"; // ÚJ IMPORT

function App() {
  const [token, setToken] = useState(localStorage.getItem("accessToken") || null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false); // ÚJ ÁLLAPOT

  // Új poszt létrehozása után frissítés
  const handlePostCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  // Logout funkció
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
  };
  
  // Regisztráció után automatikusan átvált a bejelentkezési nézetre
  const handleSuccessfulRegister = () => {
    setIsRegistering(false);
  };

  return (
    <div className="App bg-gray-100 min-h-screen py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Blog</h1>
          {token && (
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          )}
        </header>

        {!token ? (
          // Regisztráció/Bejelentkezés nézet
          <>
            {isRegistering ? (
              // Regisztrációs űrlap
              <>
                <RegisterForm onSuccessfulRegister={handleSuccessfulRegister} />
                <p className="text-center mt-4">
                  Már van fiókod?{" "}
                  <button 
                    onClick={() => setIsRegistering(false)} 
                    className="text-blue-500 hover:text-blue-700 font-medium transition"
                  >
                    Jelentkezz be
                  </button>
                </p>
              </>
            ) : (
              // Bejelentkezési űrlap
              <>
                <LoginForm setToken={setToken} />
                <p className="text-center mt-4">
                  Nincs még fiókod?{" "}
                  <button 
                    onClick={() => setIsRegistering(true)} 
                    className="text-blue-500 hover:text-blue-700 font-medium transition"
                  >
                    Regisztrálj
                  </button>
                </p>
              </>
            )}
          </>
        ) : (
          // Bejelentkezett felhasználó nézete
          <>
            {/* Poszt létrehozása */}
            <PostForm token={token} onPostCreated={handlePostCreated} />

            {/* Poszt lista */}
            <PostList token={token} refreshKey={refreshKey} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;