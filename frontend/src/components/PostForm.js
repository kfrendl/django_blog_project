import { useState } from "react";
import axios from "axios";

function PostForm({ token, onPostCreated }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/posts/",
        { title, content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setMessage("Sikeres posztolás!");
      setTitle("");
      setContent("");

      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (err) {
      console.error(err);
      setMessage("Hiba a poszt létrehozásánál");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button type="submit">Create Post</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default PostForm;
