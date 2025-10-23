import React, { useState } from 'react';
import axios from 'axios';

function PostForm({ onPostCreated }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/posts/', {
        title,
        content,
      }, {
        // ha autentikáció kell, ide jöhet pl. token header
      });

      // űrlap ürítése
      setTitle('');
      setContent('');

      // értesítjük a szülőt, hogy új poszt jött létre
      onPostCreated(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to create post');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
      <h2>Create New Post</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        <label>Title:</label><br />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: '300px', marginBottom: '10px' }}
        />
      </div>
      <div>
        <label>Content:</label><br />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{ width: '300px', height: '100px', marginBottom: '10px' }}
        />
      </div>
      <button type="submit">Submit</button>
    </form>
  );
}

export default PostForm;
