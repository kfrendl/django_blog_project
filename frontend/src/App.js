import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import RegisterForm from "./components/RegisterForm";
import axios from "axios";

function App() {
  const [token, setToken] = useState(localStorage.getItem("accessToken") || null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRegistering, setIsRegistering] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // -- FELHASZNÁLÓ LEKÉRÉSE --
  const fetchCurrentUser = async (accessToken) => {
    if (!accessToken) {
      setCurrentUser(null);
      return;
    }
    
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/user/me/", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setCurrentUser(response.data);
    } catch (err) {
      console.error("Failed to fetch current user:", err);
      handleLogout(); 
    }
  };

  useEffect(() => {
    fetchCurrentUser(token);
  }, [token]); 

  // -- FUNKCIÓK --
  const handleLogin = (accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    setToken(accessToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
    setCurrentUser(null); 
    setRefreshKey(prev => prev + 1); 
  };

  const handleSuccessfulRegister = () => {
    // Siker esetén visszavált a bejelentkezésre
    setIsRegistering(false);
  };
  
  const handlePostCreated = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const handlePostDeleted = () => {
    setRefreshKey(prev => prev + 1);
  };


  return (
    <div className="App bg-gray-100 min-h-screen py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header/Navigáció */}
        <header className="flex justify-between items-center mb-6 p-4 bg-white shadow rounded-lg">
          <h1 className="text-3xl font-bold text-gray-800">Electric Ink Blog</h1>
          {token && (
            <div className="flex items-center space-x-4">
                {currentUser && (
                    <span className="text-gray-600">
                        Hello, {currentUser.username}!
                        {currentUser.is_admin && <span className="ml-2 text-sm text-red-500">(Admin)</span>}
                    </span>
                )}
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </header>

        {/* Regisztráció/Login szekció */}
        {!token ? (
          <div className="bg-white p-6 rounded shadow-md">
            {isRegistering ? (
              <RegisterForm 
                onSuccessfulRegister={handleSuccessfulRegister} 
                onCancel={() => setIsRegistering(false)} 
              />
            ) : (
              <>
                <LoginForm onLogin={handleLogin} />
                <p className="mt-4 text-center">
                  No account?{" "}
                  <button
                    onClick={() => setIsRegistering(true)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Register!
                  </button>
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Poszt létrehozása */}
            <PostForm token={token} onPostCreated={handlePostCreated} />

            {/* Poszt lista */}
            <PostList 
              token={token} 
              refreshKey={refreshKey} 
              onPostDeleted={handlePostDeleted}
              currentUser={currentUser} 
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;