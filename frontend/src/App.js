import React, { useState, useEffect } from "react";
import LoginForm from "./components/LoginForm";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";

function App() {
  const [token, setToken] = useState(localStorage.getItem("accessToken") || null);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setToken(null);
  };

  return (
    <div className="App">
      {!token ? (
        <LoginForm setToken={setToken} />
      ) : (
        <>
          <button onClick={handleLogout}>Logout</button>
          <PostForm token={token} />
          <PostList token={token} />
        </>
      )}
    </div>
  );
}

export default App;
