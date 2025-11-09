import { useState } from "react";
import axios from "axios";

function CommentForm({ token, postId, onCommentCreated }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return; // Üres komment kizárása

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/comments/",
        { 
          content,
          post: postId // Ezt a post ID-t küldjük el a backendnek
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      // Sikeres létrehozás után értesítjük a szülőt
      if (onCommentCreated) {
        onCommentCreated(response.data);
      }
      setContent(""); // Űrlap törlése
    } catch (err) {
      console.error("Hiba a komment létrehozásakor:", err);
      setError("Hiba történt a komment elküldésekor. Kérlek, próbáld újra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-4 bg-gray-50 border rounded-lg">
      <h4 className="font-semibold text-gray-700 mb-2">Comment</h4>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={token ? "Write a comment..." : "Jelentkezz be a kommenteléshez."}
        rows="2"
        disabled={loading || !token}
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
      />
      <div className="flex justify-between items-center mt-2">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading || !token || !content.trim()}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition disabled:opacity-50 ml-auto"
        >
          {loading ? "Küldés..." : "Send"}
        </button>
      </div>
      {!token && (
        <p className="text-sm text-gray-500 mt-2">A kommenteléshez be kell jelentkezned.</p>
      )}
    </form>
  );
}

export default CommentForm;