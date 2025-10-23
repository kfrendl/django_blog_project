import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PostForm from './PostForm';

function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = () => {
    axios.get('http://127.0.0.1:8000/api/posts/')
      .then(response => {
        setPosts(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to fetch posts');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]); // az új posztot hozzáadjuk a listához
  };

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <PostForm onPostCreated={handlePostCreated} />

      <h1>Blog Posts</h1>
      {posts.length === 0 ? (
        <p>No posts available</p>
      ) : (
        posts.map(post => (
          <div key={post.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <h2>{post.title}</h2>
            <p>{post.content}</p>
            <small>Author: {post.user?.username || 'Anonymous'}</small><br />
            <small>Created at: {new Date(post.created_at).toLocaleString()}</small>
          </div>
        ))
      )}
    </div>
  );
}

export default PostList;
